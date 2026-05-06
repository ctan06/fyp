import os
import subprocess
import logging
from database import routers_collection, router_configs_collection
from models.router_config import RouterConfig

logger = logging.getLogger("scheduler.fetch_configs")

ANSIBLE_DIR = "../ansible"
PLAYBOOK_FILE = os.path.join(ANSIBLE_DIR, "show_run.yaml")
INVENTORY_FILE = os.path.join(ANSIBLE_DIR, "inventory.ini")

def scheduled_fetch_all_configs():
    logger.info("Scheduled config fetch started...")

    routers = list(routers_collection.find({}))

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
                logger.info(f"No change for {router_name}, skipping.")
                skipped.append(router_name)
                continue

            next_version = (latest_config["version"] + 1) if latest_config else 1

            router_config = RouterConfig(
                router_id=router_id,
                config=config_text,
                version=next_version,
                config_hash=new_hash,
            )

            router_configs_collection.insert_one(router_config.to_dict())
            logger.info(f"Saved version {next_version} for {router_name}")
            updated.append(router_name)

        except subprocess.CalledProcessError:
            logger.error(f"Ansible failed for {router_name}")
            failed.append(router_name)

    logger.info(f"Done. Updated: {updated} | Skipped: {skipped} | Failed: {failed}")