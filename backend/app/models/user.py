from datetime import datetime, timezone

class User:
    """
    Represents a user document in MongoDB.
    MongoDB will generate the _id automatically.
    """
    def __init__(self, email: str, password: str, created_at: datetime = None):
        self.email = email
        self.password = password
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        """
        Converts the user object to a dict for MongoDB insertion.
        MongoDB will generate _id automatically.
        """
        return {
            "email": self.email,
            "password": self.password,
            "created_at": self.created_at
        }

    def to_response(self, _id):
        """
        Convert to response format including the MongoDB _id.
        """
        return {
            "id": str(_id),
            "email": self.email,
            "created_at": self.created_at
        }