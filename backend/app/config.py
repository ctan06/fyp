from dotenv import load_dotenv
import os

load_dotenv()

# MongoDB
MONGO_URI = os.getenv("MONGO_URI")

# JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not MONGO_URI or not JWT_SECRET_KEY:
    raise RuntimeError("Critical environment variables missing!")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30