from fastapi import APIRouter, Depends, HTTPException, status
from database import routers_collection, configs_collection
from models.config_snapshot import ConfigSnapshot
from dependencies.auth import get_current_user
from models.router import Router
from datetime import datetime, timezone
import subprocess
import hashlib
import asyncio
import os
import json

router = APIRouter()

# Paths to playbook and inventory
ANSIBLE_DIR = "../ansible"
PLAYBOOK_FILE = os.path.join(ANSIBLE_DIR, "show_run.yaml")
INVENTORY_FILE = os.path.join(ANSIBLE_DIR, "inventory.ini")

# How often to run the playbook automatically (seconds)
AUTOMATION_INTERVAL = 600  # 10 minutes


async def automated_snapshot_task():
    """Background task that periodically runs the playbook."""
    while True:
        try:
            print("[Automation] Running Ansible playbook...")
            subprocess.run(
                ["ansible-playbook", PLAYBOOK_FILE, "-i", INVENTORY_FILE, "-o", "--json"],
                capture_output=True,
                text=True,
                check=True
            )
            print("[Automation] Playbook run completed.")
        except subprocess.CalledProcessError as e:
            print(f"[Automation] Playbook failed: {e.stderr}")

        # Wait until next run
        await asyncio.sleep(AUTOMATION_INTERVAL)


@router.on_event("startup")
async def start_automation():
    """Start the automated snapshot task when the app starts."""
    asyncio.create_task(automated_snapshot_task())


@router.get("/")
def root():
    """Health check for Ansible routes."""
    return {"status": "Ansible routes are running"}


@router.get("/run-playbook")
def run_playbook():
    """
    Run the Ansible playbook on all routers.
    Saves router metadata and configuration snapshots to MongoDB.
    This is the manual trigger.
    """
    try:
        result = subprocess.run(
            ["ansible-playbook", PLAYBOOK_FILE, "-i", INVENTORY_FILE],
            capture_output=True,
            text=True,
            check=True
        )

        router_outputs = []
        for line in result.stdout.splitlines():
            try:
                data = json.loads(line)
                router_outputs.append(data["router_data"])
            except Exception:
                continue

        saved_snapshots = []

        for router_data in router_outputs:
            name = router_data["name"]
            ip = router_data["ip"]
            config = router_data["config"]

            db_router = routers_collection.find_one({"ip": ip})
            if not db_router:
                new_router = Router(name=name, ip=ip)
                routers_collection.insert_one(new_router.to_dict())
                db_router = new_router.to_dict()

            checksum = hashlib.sha256(config.encode("utf-8")).hexdigest()

            snapshot = ConfigSnapshot(
                router_id=db_router["_id"],
                router_name=name,
                router_ip=ip,
                config=config,
                checksum=checksum,
                captured_at=datetime.utcnow()
            )
            configs_collection.insert_one(snapshot.to_dict())

            saved_snapshots.append({
                "router": name,
                "ip": ip,
                "snapshot_id": str(snapshot._id),
                "captured_at": snapshot.captured_at,
                "checksum": checksum
            })

        return {"status": "success", "data": saved_snapshots}

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ansible playbook failed: {e.stderr}"
        )


@router.get("/latest-snapshots")
def latest_snapshots():
    """
    Fetch the latest snapshot for each router.
    Dynamically compute 'changed' by comparing with the previous snapshot.
    """
    routers = list(routers_collection.find())
    result = []

    for r in routers:
        snapshots = list(configs_collection.find({"router_id": r["_id"]}).sort("captured_at", -1))
        if not snapshots:
            continue

        latest = snapshots[0]
        previous = snapshots[1] if len(snapshots) > 1 else None

        changed = False
        if previous and latest["checksum"] != previous["checksum"]:
            changed = True

        result.append({
            "router": r["name"],
            "ip": r["ip"],
            "latest_snapshot_id": str(latest["_id"]),
            "captured_at": latest["captured_at"],
            "changed": changed
        })

    return {"status": "success", "data": result}