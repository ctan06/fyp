from pydantic import BaseModel, Field
from datetime import datetime

class ConfigSnapshotCreate(BaseModel):
    router_id: str
    router_name: str
    router_ip: str
    config: str
    source: str = "ansible"
    checksum: str | None = None

class ConfigSnapshotOut(BaseModel):
    id: str = Field(..., alias="_id")
    router_id: str
    router_name: str
    router_ip: str
    config: str
    captured_at: datetime
    source: str
    checksum: str | None = None