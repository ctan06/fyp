from datetime import datetime, timezone

class Router:
    """
    Represents a router device in MongoDB
    """
    def __init__(
        self,
        name: str,
        ip: str,
        created_at: datetime | None = None,
    ):
        self.name = name
        self.ip = ip
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        return {
            "name": self.name,
            "ip": self.ip,
            "created_at": self.created_at,
        }
    
    def to_response(self, _id):
        return {
            "id": str(_id),  
            "name": self.name,
            "ip": self.ip,
            "created_at": self.created_at,
        }