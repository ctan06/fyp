from pydantic import BaseModel, Field
from datetime import datetime

class RouterConfigCreate(BaseModel):
    router_id: str = Field(..., example="64e9c3f6a2b1e4f123456789")
    config: str = Field(..., example="interface GigabitEthernet0/1\n ip address 192.168.1.1 255.255.255.0")

class RouterConfigOut(BaseModel):
    id: str
    router_id: str
    config: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }