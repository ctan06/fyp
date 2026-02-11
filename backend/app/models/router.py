from datetime import datetime, timezone
from bson import ObjectId
from pydantic import IPvAnyAddress

class Router:
    """
    Represents a router device in MongoDB
    """
    def __init__(
        self,
        name: str,
        ip: str,
        created_at: datetime | None = None,
        _id: ObjectId | None = None
    ):
        self._id = _id or ObjectId()
        self.name = name
        self.ip = ip
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        return {
            "_id": self._id,
            "name": self.name,
            "ip": self.ip,
            "created_at": self.created_at,
        }