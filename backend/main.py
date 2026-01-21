from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import subprocess
import os

app = FastAPI(title="Simple Ansible API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to playbook and inventory inside project
ANSIBLE_DIR = "../ansible"
PLAYBOOK_FILE = os.path.join(ANSIBLE_DIR, "show_run.yaml")
INVENTORY_FILE = os.path.join(ANSIBLE_DIR, "inventory.ini")

@app.get("/")
def root():
    return {"status": "Backend is running"}

@app.get("/run-playbook")
def run_playbook():
    """
    Runs the Ansible playbook and returns stdout and stderr as JSON.
    """
    # Run the playbook using subprocess
    result = subprocess.run(
        ["ansible-playbook", PLAYBOOK_FILE, "-i", INVENTORY_FILE],
        capture_output=True,
        text=True
    )

    return {
        "stdout": result.stdout.splitlines(),  # list of stdout lines
        "stderr": result.stderr.splitlines()   # list of stderr lines
    }