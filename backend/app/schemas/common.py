from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampedORMModel(ORMModel):
    id: int | str
    created_at: datetime
    updated_at: datetime | None = None
