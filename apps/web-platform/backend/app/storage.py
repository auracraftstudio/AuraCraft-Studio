from __future__ import annotations

import base64
import hashlib
import io
import logging
import mimetypes
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO
from urllib.parse import quote, urlsplit, urlunsplit

import requests

logger = logging.getLogger("auracraft.storage")

IMAGE_MAX_BYTES = 10 * 1024 * 1024
MEDIA_MAX_BYTES = 100 * 1024 * 1024
B2_MAX_BYTES = 5 * 1024 * 1024 * 1024


@dataclass(frozen=True)
class StoredObject:
    provider: str
    object_key: str
    size_bytes: int
    checksum_sha256: str
    url: str | None = None


def is_b2_configured() -> bool:
    key_id = os.getenv("B2_APPLICATION_KEY_ID", "").strip()
    key = os.getenv("B2_APPLICATION_KEY", "").strip()
    bucket = os.getenv("B2_BUCKET_NAME", "").strip()
    return bool(key_id and key and bucket)


def is_cloudinary_configured() -> bool:
    cloud = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    key = os.getenv("CLOUDINARY_API_KEY", "").strip()
    secret = os.getenv("CLOUDINARY_API_SECRET", "").strip()
    return bool(cloud and key and secret)


def classify_media_storage(filename: str, content_type: str, size_bytes: int) -> str:
    """Route images/textures to Cloudinary and large videos/VRM packages to Backblaze B2."""
    ext = Path(filename).suffix.lower()
    image_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    image_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}

    if (ext in image_exts or content_type in image_types) and size_bytes <= IMAGE_MAX_BYTES:
        if is_cloudinary_configured():
            return "cloudinary"
    if is_b2_configured():
        return "b2"
    return "local"


def upload_to_b2(file_obj: BinaryIO, object_key: str, content_type: str = "application/octet-stream") -> StoredObject:
    """Upload asset to Backblaze B2 bucket via S3-compatible API."""
    import boto3
    from botocore.config import Config

    endpoint = os.getenv("B2_ENDPOINT_URL", "https://s3.eu-central-003.backblazeb2.com").strip()
    bucket = os.getenv("B2_BUCKET_NAME", "auracraft-studio-vault").strip()
    key_id = os.getenv("B2_APPLICATION_KEY_ID", "").strip()
    app_key = os.getenv("B2_APPLICATION_KEY", "").strip()
    region = os.getenv("B2_REGION", "eu-central-003").strip()

    body = file_obj.read()
    size = len(body)
    sha256 = hashlib.sha256(body).hexdigest()

    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=key_id,
        aws_secret_access_key=app_key,
        region_name=region,
        config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
    )

    client.put_object(
        Bucket=bucket,
        Key=object_key,
        Body=body,
        ContentType=content_type,
    )

    expiry = int(os.getenv("B2_SIGNED_URL_EXPIRY_SECONDS", "900"))
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": object_key},
        ExpiresIn=expiry,
    )

    return StoredObject(
        provider="b2",
        object_key=object_key,
        size_bytes=size,
        checksum_sha256=sha256,
        url=url,
    )


def upload_to_cloudinary(file_obj: BinaryIO, filename: str, content_type: str) -> StoredObject:
    """Upload image/avatar preview to Cloudinary via HTTP REST API or SDK."""
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "vnlh1wjv").strip()
    api_key = os.getenv("CLOUDINARY_API_KEY", "").strip()
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "").strip()
    folder = os.getenv("CLOUDINARY_FOLDER", "auracraft-studio").strip()

    body = file_obj.read()
    size = len(body)
    sha256 = hashlib.sha256(body).hexdigest()

    public_id = f"{folder}/{Path(filename).stem}_{sha256[:10]}"
    timestamp = str(int(time.time()))

    # Try official SDK if installed
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )

        result = cloudinary.uploader.upload(
            body,
            public_id=public_id,
            overwrite=True,
            resource_type="auto",
        )
        secure_url = result.get("secure_url", "")
        return StoredObject(
            provider="cloudinary",
            object_key=result.get("public_id", public_id),
            size_bytes=size,
            checksum_sha256=sha256,
            url=secure_url,
        )
    except ImportError:
        pass

    # Direct HTTPS upload with signature (Cloudinary requires SHA-1 per their API spec)
    to_sign = f"public_id={public_id}&timestamp={timestamp}{api_secret}"
    signature = hashlib.new("sha1", to_sign.encode("utf-8"), usedforsecurity=False).hexdigest()  # noqa: S324

    b64_data = f"data:{content_type};base64," + base64.b64encode(body).decode("utf-8")
    payload = {
        "file": b64_data,
        "api_key": api_key,
        "timestamp": timestamp,
        "public_id": public_id,
        "signature": signature,
    }

    resp = requests.post(
        f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload",
        data=payload,
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    return StoredObject(
        provider="cloudinary",
        object_key=data.get("public_id", public_id),
        size_bytes=size,
        checksum_sha256=sha256,
        url=data.get("secure_url"),
    )


def upload_asset(file_obj: BinaryIO, filename: str, content_type: str | None = None) -> StoredObject:
    """Smart router to route assets to Cloudinary or B2 based on file type."""
    if not content_type:
        content_type, _ = mimetypes.guess_type(filename)
        content_type = content_type or "application/octet-stream"

    file_obj.seek(0, io.SEEK_END)
    size_bytes = file_obj.tell()
    file_obj.seek(0)

    target = classify_media_storage(filename, content_type, size_bytes)

    if target == "cloudinary":
        return upload_to_cloudinary(file_obj, filename, content_type)
    elif target == "b2":
        object_key = f"auracraft/{Path(filename).stem}_{hashlib.sha256(filename.encode()).hexdigest()[:8]}{Path(filename).suffix}"
        return upload_to_b2(file_obj, object_key, content_type)
    else:
        # Fallback local hash
        body = file_obj.read()
        sha256 = hashlib.sha256(body).hexdigest()
        return StoredObject(
            provider="local",
            object_key=filename,
            size_bytes=size_bytes,
            checksum_sha256=sha256,
            url=None,
        )
