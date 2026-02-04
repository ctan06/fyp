from pydantic import BaseModel, Field
from datetime import datetime

class RouterCreate(BaseModel):
    name: str = Field(..., example="R1")
    ip: str = Field(..., example="192.168.56.101")
    vendor: str = "cisco"
    model: str = "ios"

class RouterOut(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    ip: str
    vendor: str
    model: str
    created_at: datetime