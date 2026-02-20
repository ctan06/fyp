from pymongo import MongoClient, errors
from config import MONGO_URI

def connect_mongo(uri=MONGO_URI, db_name="FYP"):
    """
    Connect to MongoDB and return (client, db).
    Returns (None, None) if connection fails.
    """
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.server_info()
        db = client[db_name]
        print(f"Connected to MongoDB database: {db_name}")
        return client, db

    except errors.ServerSelectionTimeoutError as e:
        print("Failed to connect to MongoDB (timeout):", e)
        return None, None

    except Exception as e:
        print("An unexpected error occurred:", e)
        return None, None

def get_collection(db, collection_name):
    """
    Return a collection object from the database.
    Returns None if db is None.
    """
    if db is None:
        print("Database not connected. Cannot get collection.")
        return None
    return db[collection_name]

def close_mongo(client):
    """Close MongoDB connection safely."""
    if client:
        client.close()
        print("MongoDB connection closed.")

client, db = connect_mongo()
if db is None:
    raise RuntimeError("Could not connect to MongoDB") 
users_collection = get_collection(db, "users")
routers_collection = get_collection(db, "routers")
router_configs_collection = get_collection(db,"router_configurations")

users_collection.create_index("email", unique=True)
routers_collection.create_index("name", unique=True)
routers_collection.create_index("ip", unique=True)
#MongoDB will index documents first by router_id, then sort by created_at (descending).
router_configs_collection.create_index([("router_id", 1), ("created_at", -1)])