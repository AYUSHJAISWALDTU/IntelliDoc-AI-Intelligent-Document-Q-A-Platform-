import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from app.config import settings
import structlog

logger = structlog.get_logger()


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
        config=Config(signature_version="s3v4"),
    )


def upload_file_to_s3(file_bytes: bytes, s3_key: str, content_type: str) -> str:
    client = get_s3_client()
    try:
        client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return s3_key
    except ClientError as e:
        logger.error("s3_upload_failed", key=s3_key, error=str(e))
        raise


def download_file_from_s3(s3_key: str) -> bytes:
    client = get_s3_client()
    try:
        response = client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
        return response["Body"].read()
    except ClientError as e:
        logger.error("s3_download_failed", key=s3_key, error=str(e))
        raise


def delete_file_from_s3(s3_key: str) -> None:
    client = get_s3_client()
    try:
        client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
    except ClientError as e:
        logger.error("s3_delete_failed", key=s3_key, error=str(e))
        raise


def generate_presigned_url(s3_key: str, expiry: int = None) -> str:
    client = get_s3_client()
    try:
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": s3_key},
            ExpiresIn=expiry or settings.S3_PRESIGNED_URL_EXPIRY,
        )
    except ClientError as e:
        logger.error("s3_presigned_url_failed", key=s3_key, error=str(e))
        raise


def get_s3_key(space_id: str, doc_id: str, file_name: str) -> str:
    return f"spaces/{space_id}/documents/{doc_id}/{file_name}"
