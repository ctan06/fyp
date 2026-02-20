from pydantic import BaseModel, Field
from datetime import datetime

class RouterConfigOut(BaseModel):
    id: str
    router_id: str
    config: str
    version: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }