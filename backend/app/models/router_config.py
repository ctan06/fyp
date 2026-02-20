from datetime import datetime, timezone
import hashlib

class RouterConfig:
    """
    Represents a router configuration in MongoDB
    """
    def __init__(
        self,
        router_id: str,    
        config: str,
        version: int,
        config_hash: str | None = None,
        created_at: datetime | None = None,
    ):
        self.router_id = router_id
        self.config = config
        self.version = version
        self.config_hash = config_hash or self.generate_hash(config)
        self.created_at = created_at or datetime.now(timezone.utc)
    

    @staticmethod
    def generate_hash(config: str) -> str:
        return hashlib.sha256(config.encode()).hexdigest()

    def to_dict(self):
        """
        Convert to dictionary for MongoDB insertion
        """
        return {
            "router_id": self.router_id,
            "config": self.config,
            "version": self.version,
            "config_hash": self.config_hash,
            "created_at": self.created_at,
        }

    def to_response(self, _id):
        """
        Convert to response format (for FastAPI response_model)
        """
        return {
            "id": str(_id), 
            "router_id": self.router_id,
            "config": self.config,
            "version": self.version,
            "created_at": self.created_at,
        }