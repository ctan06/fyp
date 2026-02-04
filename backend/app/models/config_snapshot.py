from datetime import datetime, timezone
from bson import ObjectId

class ConfigSnapshot:
    """
    Represents a router configuration snapshot
    """
    def __init__(
        self,
        router_id: ObjectId,
        router_name: str,
        router_ip: str,
        config: str,
        captured_at: datetime | None = None,
        source: str = "ansible",
        checksum: str | None = None,
        _id: ObjectId | None = None
    ):
        self._id = _id or ObjectId()
        self.router_id = router_id
        self.router_name = router_name
        self.router_ip = router_ip
        self.config = config
        self.captured_at = captured_at or datetime.now(timezone.utc)
        self.source = source
        self.checksum = checksum

    def to_dict(self):
        return {
            "_id": self._id,
            "router_id": self.router_id,
            "router_name": self.router_name,
            "router_ip": self.router_ip,
            "config": self.config,
            "captured_at": self.captured_at,
            "source": self.source,
            "checksum": self.checksum
        }