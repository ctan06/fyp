from fastapi import APIRouter, HTTPException
from database import users_collection
from models.user import User
from schemas.user import UserCreate, UserLogin, UserOut
from utils.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate):
    # Check if email already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_pw = hash_password(user.password)

    # Create user object
    new_user = User(email=user.email, password=hashed_pw)

    # Insert into MongoDB
    users_collection.insert_one(new_user.to_dict())

    # Return safe response
    return {"email": user.email, "created_at": new_user.created_at}

@router.post("/login")
def login(user: UserLogin):
    # Find user in DB
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT token
    token = create_access_token({"sub": str(db_user["_id"])})

    return {"access_token": token, "token_type": "bearer"}