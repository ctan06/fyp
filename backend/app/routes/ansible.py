from fastapi import APIRouter, Depends, HTTPException, status
from dependencies.auth import get_current_user
import subprocess
import os

router = APIRouter()

ANSIBLE_DIR = "../ansible" 
PLAYBOOK_FILE = os.path.join(ANSIBLE_DIR, "show_run.yaml")
INVENTORY_FILE = os.path.join(ANSIBLE_DIR, "inventory.ini")

@router.get("/")
def root():
    return {"status": "Ansible routes are running"}

@router.get("/run-playbook")
def run_playbook(current_user=Depends(get_current_user)):
    """
    Runs the Ansible playbook.
    Only accessible if JWT token is valid.
    """
    try:
        result = subprocess.run(
            ["ansible-playbook", PLAYBOOK_FILE, "-i", INVENTORY_FILE],
            capture_output=True,
            text=True,
            check=True  # raises CalledProcessError if playbook fails
        )
        return {
            "stdout": result.stdout.splitlines(),
            "stderr": result.stderr.splitlines()
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ansible playbook failed: {e.stderr}"
        )