from datetime import datetime, timezone
from bson import ObjectId

class Router:
    """
    Represents a router device in MongoDB
    """
    def __init__(
        self,
        name: str,
        ip: str,
        vendor: str = "cisco",
        model: str = "ios",
        created_at: datetime | None = None,
        _id: ObjectId | None = None
    ):
        self._id = _id or ObjectId()
        self.name = name
        self.ip = ip
        self.vendor = vendor
        self.model = model
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        return {
            "_id": self._id,
            "name": self.name,
            "ip": self.ip,
            "vendor": self.vendor,
            "model": self.model,
            "created_at": self.created_at,
        }