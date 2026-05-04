from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from config import JWT_SECRET_KEY, ALGORITHM
from database import users_collection
from jose import JWTError, jwt
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        try:
            obj_id = ObjectId(user_id) 
        except Exception:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = users_collection.find_one({"_id": obj_id})

    if user is None:
        raise credentials_exception

    return {
        "id": str(user["_id"]),
        "email": user["email"]
    }