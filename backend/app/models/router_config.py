from datetime import datetime, timezone

class RouterConfig:
    """
    Represents a router configuration in MongoDB
    """
    def __init__(
        self,
        router_id: str,     # Mongo ObjectId as string
        config: str,
        created_at: datetime | None = None,
    ):
        self.router_id = router_id
        self.config = config
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        """
        Convert to dictionary for MongoDB insertion
        """
        return {
            "router_id": self.router_id,
            "config": self.config,
            "created_at": self.created_at,
        }

    def to_response(self, _id):
        """
        Convert to response format (for FastAPI response_model)
        """
        return {
            "id": str(_id),    # Mongo-generated _id
            "router_id": self.router_id,
            "config": self.config,
            "created_at": self.created_at,
        }