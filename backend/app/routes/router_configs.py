from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId 
import subprocess 
import os 
import json 
import re

from pydantic import BaseModel
from dependencies.auth import get_current_user 
from database import routers_collection

router = APIRouter() 

ANSIBLE_DIR = "../ansible" 
FETCH_STRUCTURED_PLAYBOOK = os.path.join(ANSIBLE_DIR, "fetch_structured.yaml") 
APPLY_PLAYBOOK = os.path.join(ANSIBLE_DIR, "apply_config.yaml") 
EXECUTE_PLAYBOOK = os.path.join(ANSIBLE_DIR, "execute_command.yaml")
INVENTORY_FILE = os.path.join(ANSIBLE_DIR, "inventory.ini")

class CommandPayload(BaseModel):
    command: str

@router.get("/router/{router_id}/structured-config")
def get_structured_config(router_id: str, current_user=Depends(get_current_user)):

    # Validate router ID
    try:
        obj_id = ObjectId(router_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    router_obj = routers_collection.find_one({
        "_id": obj_id,
        "user_id": current_user["id"]
    })

    if not router_obj:
        raise HTTPException(status_code=404, detail="Router not found")

    try:
        result = subprocess.run(
            [
                "ansible-playbook",
                FETCH_STRUCTURED_PLAYBOOK,
                "-i",
                INVENTORY_FILE,
                "--limit",
                router_obj["name"]
            ],
            capture_output=True,
            text=True,
            check=True
        )

        stdout = result.stdout

        # Extract JSON string from Ansible output
        match = re.search(r'"msg":\s*"(.+)"', stdout, re.DOTALL)
        if not match:
            raise HTTPException(500, "Failed to extract JSON from Ansible output")

        json_str = match.group(1)
        json_str = json_str.encode('utf-8').decode('unicode_escape')

        structured = json.loads(json_str)

        # Clean hostname
        if "hostname" in structured:
            structured["hostname"] = structured["hostname"].split()[-1]

        # PARSE INTERFACES WITH MASK
        def parse_interfaces(brief_output, config_output):
            interfaces = []

            brief_lines = brief_output.splitlines()
            config_lines = config_output.splitlines()

            for line in brief_lines[1:]:  # skip header
                parts = line.split()
                if len(parts) < 6:
                    continue

                name = parts[0]
                ip = None if parts[1] == "unassigned" else parts[1]
                status = "up" if parts[4] == "up" else "down"

                mask = None

                #  find mask in running-config
                for i, cfg_line in enumerate(config_lines):
                    if cfg_line.strip().startswith(f"interface {name}"):
                        for j in range(i + 1, i + 5):
                            if j < len(config_lines) and "ip address" in config_lines[j]:
                                cfg_parts = config_lines[j].strip().split()
                                if len(cfg_parts) >= 4:
                                    mask = cfg_parts[3]
                                break
                        break

                interfaces.append({
                    "name": name,
                    "ip": ip,
                    "mask": mask,
                    "status": status
                })

            return interfaces

        # Apply parsing
        structured["interfaces"] = parse_interfaces(
            structured["interfaces_brief"],
            structured["interfaces_config"]
        )

        # Clean raw fields
        structured.pop("interfaces_brief", None)
        structured.pop("interfaces_config", None)

        return {
            "router_id": router_id,
            "config": structured
        }

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch structured config: {e.stderr}"
        )

@router.post("/router/{router_id}/apply-config")
def apply_config(router_id: str, payload: dict, current_user=Depends(get_current_user)):

    # Validate router
    try:
        obj_id = ObjectId(router_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    router_obj = routers_collection.find_one({
        "_id": obj_id, 
        "user_id": current_user["id"]
    })

    if not router_obj:
        raise HTTPException(status_code=404, detail="Router not found")

    router_name = router_obj["name"]

    # APPLY CONFIG 
    try:
        subprocess.run(
            [
                "ansible-playbook",
                APPLY_PLAYBOOK,
                "-i",
                INVENTORY_FILE,
                "--limit",
                router_name,
                "--extra-vars",
                json.dumps(payload)
            ],
            capture_output=True,
            text=True,
            check=True
        )

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply config:\nSTDOUT:\n{e.stdout}\nSTDERR:\n{e.stderr}"
        )

    # RESPONSE 
    return {
        "status": "success",
        "message": "Configuration applied successfully",
        "router_id": router_id
    }
    
@router.post("/execute-command")
def execute_command_on_all(payload: CommandPayload, current_user=Depends(get_current_user)):
    
    # Get all routers for this user
    routers = list(routers_collection.find({
        "user_id": current_user["id"]
    }))

    if not routers:
        raise HTTPException(status_code=404, detail="No routers found")

    results = []

    for router_obj in routers:
        router_name = router_obj["name"]

        try:
            subprocess.run(
                [
                    "ansible-playbook",
                    EXECUTE_PLAYBOOK,
                    "-i",
                    INVENTORY_FILE,
                    "--limit",
                    router_name,
                    "--extra-vars",
                    f"command='{payload.command}'"
                ],
                capture_output=True,
                text=True,
                check=True
            )
            results.append({
                "router": router_name,
                "status": "success"
            })

        except subprocess.CalledProcessError:
            results.append({
                "router": router_name,
                "status": "failed"
            })

    return {
        "command": payload.command,
        "results": results
    }