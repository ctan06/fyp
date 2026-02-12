from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from database import routers_collection
from models.router import Router
from schemas.router import RouterCreate, RouterOut
from dependencies.auth import get_current_user

router = APIRouter(prefix="/routers", tags=["routers"])

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


    # Insert into MongoDB
    try:
        routers_collection.insert_one(new_router.to_dict())
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="Router name or IP already exists"
        )

    # update_inventory_file()

    return new_router
