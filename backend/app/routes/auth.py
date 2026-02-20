from utils.security import hash_password, verify_password, create_access_token
from schemas.user import UserCreate, UserLogin, UserOut
from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError
from database import users_collection
from models.user import User

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate):
    hashed_pw = hash_password(user.password)
    new_user = User(email=user.email, password=hashed_pw)

    try:
        result = users_collection.insert_one(new_user.to_dict())
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email already registered")

    return new_user.to_response(result.inserted_id)

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user["_id"])})

    return {"access_token": token, "token_type": "bearer", "user": {"id": str(db_user["_id"]), "email": db_user["email"]}}