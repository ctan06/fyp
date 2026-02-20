from database import routers_collection, router_configs_collection
from fastapi import APIRouter, Depends, HTTPException, status
from dependencies.auth import get_current_user
from models.router_config import RouterConfig
from bson import ObjectId
import subprocess
import os


router = APIRouter()

ANSIBLE_DIR = "../ansible"
PLAYBOOK_FILE = os.path.join(ANSIBLE_DIR, "show_run.yaml")
INVENTORY_FILE = os.path.join(ANSIBLE_DIR, "inventory.ini")


@router.post("/fetch-config/{router_id}")
def fetch_router_config(router_id: str, current_user=Depends(get_current_user)):
    """
    Fetch the running config of a specific router using Ansible,
    store it in MongoDB, and return it.
    """

    # Validate ObjectId
    try:
        obj_id = ObjectId(router_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    router_obj = routers_collection.find_one({"_id": obj_id})
    if not router_obj:
        raise HTTPException(status_code=404, detail="Router not found")

    # Run Ansible playbook for this router only
    try:
        result = subprocess.run(
            ["ansible-playbook", PLAYBOOK_FILE, "-i", INVENTORY_FILE, "--limit", router_obj["name"]],
            capture_output=True,
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ansible playbook failed: {e.stderr}"
        )

    # Extract configuration from Ansible output (simplest: look for "router_data")
    # Here you can parse stdout or adapt your playbook to produce JSON in a file
    # For demonstration, we assume stdout contains the config in the last line
    config_lines = result.stdout.splitlines()
    config_text = "\n".join(config_lines)  # You may refine parsing for real JSON output

    #
    router_config = RouterConfig(router_id=router_id, config=config_text)
    insert_result = router_configs_collection.insert_one(router_config.to_dict())

    return router_config.to_response(insert_result.inserted_id)


@router.get("/view-config/{config_id}")
def view_config(config_id: str, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(config_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid config ID")

    config_doc = router_configs_collection.find_one({"_id": obj_id})
    if not config_doc:
        raise HTTPException(status_code=404, detail="Configuration not found")

    # Use RouterConfig model for consistent response
    router_config = RouterConfig(
        router_id=str(config_doc["router_id"]),
        config=config_doc["config"],
        created_at=config_doc["created_at"]
    )
    return router_config.to_response(config_doc["_id"])