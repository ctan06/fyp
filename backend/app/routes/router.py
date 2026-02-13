from fastapi import APIRouter, HTTPException, Depends
from schemas.router import RouterCreate, RouterOut
from utils.inventory import update_inventory_file
from dependencies.auth import get_current_user
from pymongo.errors import DuplicateKeyError
from database import routers_collection
from models.router import Router
from bson import ObjectId

router = APIRouter()

@router.get("/all", response_model=list[RouterOut])
def get_all_routers(current_user=Depends(get_current_user)):
    """
    Get all routers from MongoDB.
    Returns a list of routers with their id, name, IP, and created_at.
    Only authenticated users can access.
    """
    routers_cursor = routers_collection.find()
    routers_list = []

    for r in routers_cursor:
        router_obj = Router(
            name=r["name"],
            ip=r["ip"],
            created_at=r.get("created_at")
        )
        routers_list.append(router_obj.to_response(r["_id"]))

    return routers_list

@router.post("/add", response_model=RouterOut)
def add_router(router_data: RouterCreate, current_user=Depends(get_current_user)):
    """
    Add a new router to MongoDB
    Only authenticated users can add routers
    """

    # Create Router object
    new_router = Router(
        name=router_data.name,
        ip=str(router_data.ip) # converted to string to match mongodb
    )

    try:
        result = routers_collection.insert_one(new_router.to_dict())
    except DuplicateKeyError:
        raise HTTPException(400, "Router name or IP already exists")
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")

    update_inventory_file()

    return new_router.to_response(result.inserted_id) 

@router.delete("/{router_id}", response_model=dict)
def delete_router(router_id: str, current_user=Depends(get_current_user)):
    """
    Delete a router by its MongoDB _id
    Also updates the inventory file after deletion
    """
    # Validate ObjectId
    try:
        obj_id = ObjectId(router_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid router ID")

    # Attempt deletion
    result = routers_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Router not found")

    # Update the inventory file
    update_inventory_file()

    return {"message": f"Router {router_id} deleted successfully"}