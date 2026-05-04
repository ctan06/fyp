import codecs
from database import routers_collection, router_configs_collection
from fastapi import APIRouter, Depends, HTTPException, status
from dependencies.auth import get_current_user
from models.router_config import RouterConfig
from bson import ObjectId
import subprocess
import difflib
import os

router = APIRouter()

ANSIBLE_DIR = "../ansible"
PLAYBOOK_FILE = os.path.join(ANSIBLE_DIR, "show_run.yaml")
INVENTORY_FILE = os.path.join(ANSIBLE_DIR, "inventory.ini")

@router.post("/fetch-all-configs")
def fetch_all_configs(current_user=Depends(get_current_user)):
    routers = list(routers_collection.find({
        "user_id": current_user["id"] 
    }))

    updated = []
    skipped = []
    failed = []

    for router_obj in routers:
        router_id = str(router_obj["_id"])
        router_name = router_obj["name"]
       
        try:
            result = subprocess.run(
                [
                    "ansible-playbook",
                    PLAYBOOK_FILE,
                    "-i",
                    INVENTORY_FILE,
                    "--limit",
                    router_name,
                ],
                capture_output=True,
                text=True,
                check=True,
            )

            config_lines = result.stdout.splitlines()
            config_text = "\n".join(config_lines)
            new_hash = RouterConfig.generate_hash(config_text)

            latest_config = router_configs_collection.find_one(
                {"router_id": router_id},
                sort=[("version", -1)]
            )

            if latest_config and latest_config.get("config_hash") == new_hash:
                skipped.append(router_name)
                continue

            next_version = 1
            if latest_config:
                next_version = latest_config["version"] + 1

            router_config = RouterConfig(
                router_id=router_id,
                config=config_text,
                version=next_version,
                config_hash=new_hash,
            )

            router_configs_collection.insert_one(router_config.to_dict())
            updated.append(router_name)

        except subprocess.CalledProcessError:
            failed.append(router_name)

    return {
        "updated": updated,
        "skipped": skipped,
        "failed": failed,
    }

@router.post("/fetch-config/{router_id}")
def fetch_router_config(router_id: str, current_user=Depends(get_current_user)):
    """
    Fetch the running config of a specific router using Ansible.
    Store only if config changed (versioned).
    """

    # Validate ObjectId
    try:
        obj_id = ObjectId(router_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    router_obj = routers_collection.find_one({
        "_id": obj_id,
        "user_id": current_user["id"] 
    })
    if not router_obj:
        raise HTTPException(status_code=404, detail="Router not found")

    # Run Ansible playbook for this router only
    router_name = router_obj["name"]

    try:
        result = subprocess.run(
            [
                "ansible-playbook",
                PLAYBOOK_FILE,
                "-i",
                INVENTORY_FILE,
                "--limit",
                router_name
            ],
            capture_output=True,
            text=True,
            check=True
        )

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ansible playbook failed: {e.stderr}"
        )

    config_lines = result.stdout.splitlines()
    config_text = "\n".join(config_lines)  

    new_hash = RouterConfig.generate_hash(config_text)

    latest_config = router_configs_collection.find_one(
        {"router_id": router_id},
        sort=[("version", -1)]
    )

    if latest_config and latest_config.get("config_hash") == new_hash:
        return {
            "changed": False,
            "data": {
                "router_id": router_id,
                "version": latest_config["version"],
            }
        }

    next_version = 1
    if latest_config:
        next_version = latest_config["version"] + 1

    router_config = RouterConfig(
        router_id=router_id,
        config=config_text,
        version=next_version,
        config_hash=new_hash,
    )

    insert_result = router_configs_collection.insert_one(router_config.to_dict())

    return {
        "changed": True,
        "data": router_config.to_response(insert_result.inserted_id)
    }

@router.get("/view-config/{config_id}")
def view_config(config_id: str, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(config_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid config ID")

    config_doc = router_configs_collection.find_one({"_id": obj_id})

    if not config_doc:
        raise HTTPException(status_code=404, detail="Configuration not found")

    router_obj = routers_collection.find_one({
        "_id": ObjectId(config_doc["router_id"]),
        "user_id": current_user["id"]
    })

    if not router_obj:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    if not config_doc:
        raise HTTPException(status_code=404, detail="Configuration not found")

    # Use RouterConfig model for consistent response
    router_config = RouterConfig(
        router_id=str(config_doc["router_id"]),
        config=config_doc["config"],
        version=config_doc["version"],
        config_hash=config_doc.get("config_hash"),
        created_at=config_doc["created_at"]
    )

    return router_config.to_response(config_doc["_id"])

@router.get("/router/{router_id}/latest-config")
def get_latest_config(router_id: str, current_user=Depends(get_current_user)):

    try:
        obj_id = ObjectId(router_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    router = routers_collection.find_one({
        "_id": obj_id,
        "user_id": current_user["id"]
    })
    if not router:
        raise HTTPException(status_code=404, detail="Router not found")

    latest_config = router_configs_collection.find_one(
        {"router_id": router_id},
        sort=[("version", -1)]
    )

    if not latest_config:
        raise HTTPException(status_code=404, detail="No configurations found")

    return {
        "id": str(latest_config["_id"]),
        "router_id": router_id,
        "version": latest_config["version"],
        "config": latest_config["config"],
        "created_at": latest_config["created_at"]
    }

@router.get("/router/{router_id}/configs")
def list_router_configs(router_id: str, current_user=Depends(get_current_user)):

    try:
        obj_id = ObjectId(router_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    router = routers_collection.find_one({
        "_id": obj_id,
        "user_id": current_user["id"]
    })
    if not router:
        raise HTTPException(status_code=404, detail="Router not found")

    configs = list(
        router_configs_collection.find(
            {"router_id": router_id},
            {"config": 0}  # exclude large config text
        ).sort("version", -1)
    )

    return [
        {
            "id": str(cfg["_id"]),
            "version": cfg["version"],
            "created_at": cfg["created_at"],
        }
        for cfg in configs
    ]

@router.get("/router/{router_id}/compare")
def compare_configs(
    router_id: str,
    v1: int,
    v2: int,
    current_user=Depends(get_current_user)
):
    # Validate ObjectId
    try:
        obj_id = ObjectId(router_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    # Get router
    router_obj = routers_collection.find_one({
        "_id": obj_id,
        "user_id": current_user["id"]
    })
    if not router_obj:
        raise HTTPException(status_code=404, detail="Router not found")

    # Get both configs
    config1 = router_configs_collection.find_one({
        "router_id": router_id,
        "version": v1
    })

    config2 = router_configs_collection.find_one({
        "router_id": router_id,
        "version": v2
    })

    if not config1 or not config2:
        raise HTTPException(
            status_code=404,
            detail="One or both versions not found"
        )

    #  Decode configs (fix escaped \n issue)
    config_str1 = codecs.decode(config1["config"], "unicode_escape")
    config_str2 = codecs.decode(config2["config"], "unicode_escape")

    # Split + clean lines
    text1 = [
        line.strip()
        for line in config_str1.split("\n")
        if line.strip() and line.strip() != "!"
    ]

    text2 = [
        line.strip()
        for line in config_str2.split("\n")
        if line.strip() and line.strip() != "!"
    ]

    # Use SequenceMatcher for cleaner diff
    matcher = difflib.SequenceMatcher(None, text1, text2)

    formatted_diff = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "replace":
            for old, new in zip(text1[i1:i2], text2[j1:j2]):
                formatted_diff.append({
                    "type": "removed",
                    "line": old
                })
                formatted_diff.append({
                    "type": "added",
                    "line": new
                })

        elif tag == "delete":
            for old in text1[i1:i2]:
                formatted_diff.append({
                    "type": "removed",
                    "line": old
                })

        elif tag == "insert":
            for new in text2[j1:j2]:
                formatted_diff.append({
                    "type": "added",
                    "line": new
                })

        # ignore "equal" → removes unchanged lines

    return {
        "router_id": router_id,
        "version_1": v1,
        "version_2": v2,
        "diff": formatted_diff
    }