from datetime import datetime, timezone
from bson import ObjectId  

class User:
    """
    Represents a user document in MongoDB
    """
    def __init__(self, email: str, password: str, created_at: datetime = None, _id: ObjectId = None):
        self._id = _id or ObjectId()  
        self.email = email
        self.password = password 
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        """
        Converts the user object to a dict for MongoDB insertion
        """
        return {
            "_id": self._id,
            "email": self.email,
            "password": self.password,
            "created_at": self.created_at
        }