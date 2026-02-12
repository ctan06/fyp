from pydantic import BaseModel, Field, field_validator
from pydantic import IPvAnyAddress
from datetime import datetime

class RouterCreate(BaseModel):
    name: str = Field(..., example="R1")
    ip: IPvAnyAddress = Field(..., example="192.168.56.101")

    @field_validator("ip", mode="before")
    def ip_to_str(cls, v):
        return str(v)


class RouterOut(BaseModel):
    id: str 
    name: str
    ip: str
    created_at: datetime

    model_config = {
        "from_attributes": True  
    } 