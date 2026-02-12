from database import routers_collection
import os

INVENTORY_PATH = "../ansible/inventory.ini"


def update_inventory_file():
    routers = routers_collection.find()

    if not os.path.exists(INVENTORY_PATH):
        raise FileNotFoundError("inventory.ini not found")

    with open(INVENTORY_PATH, "r") as f:
        lines = f.readlines()

    new_lines = []
    inside_group = False

    for line in lines:
        if line.strip() == "[cisco_routers]":
            inside_group = True
            new_lines.append(line)

            for router in routers:
                new_lines.append(
                    f"{router['name']} ansible_host={router['ip']}\n"
                )
            continue

        if inside_group and line.startswith("[") and not line.startswith("[cisco_routers]"):
            inside_group = False

        if inside_group:
            continue

        new_lines.append(line)

    with open(INVENTORY_PATH, "w") as f:
        f.writelines(new_lines)