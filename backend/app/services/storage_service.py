from uuid import uuid4

import boto3

from app.core.config import settings


class StorageService:
    def __init__(self) -> None:
        self.bucket_name = settings.s3_bucket_name
        self.client = boto3.client(
            "s3",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

    def build_recording_key(self, call_id: int, filename: str) -> str:
        return f"calls/{call_id}/recordings/{uuid4()}-{filename}"

    def generate_presigned_upload_url(self, object_key: str, content_type: str) -> str:
        if not self.bucket_name:
            return f"missing-s3-bucket://{object_key}"

        return self.client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket_name,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=3600,
        )
