from fastapi import APIRouter
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
def run_playbook():
    """
    Runs the Ansible playbook and returns stdout and stderr as JSON.
    """
    result = subprocess.run(
        ["ansible-playbook", PLAYBOOK_FILE, "-i", INVENTORY_FILE],
        capture_output=True,
        text=True
    )

    return {
        "stdout": result.stdout.splitlines(),
        "stderr": result.stderr.splitlines()
    }