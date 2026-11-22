import io
from unittest.mock import MagicMock, patch

import pytest

from app.storage import (
    StoredObject,
    classify_media_storage,
    is_b2_configured,
    is_cloudinary_configured,
    upload_asset,
)


def test_classify_storage_cloudinary(monkeypatch):
    monkeypatch.setenv("CLOUDINARY_CLOUD_NAME", "auracraft")
    monkeypatch.setenv("CLOUDINARY_API_KEY", "986155433124188")
    monkeypatch.setenv("CLOUDINARY_API_SECRET", "V1Z7iiz3dH-JqsgwMwsO1upcBFc")
    monkeypatch.setenv("B2_APPLICATION_KEY_ID", "")

    target = classify_media_storage("character.png", "image/png", 500_000)
    assert target == "cloudinary"


def test_classify_storage_b2(monkeypatch):
    monkeypatch.setenv("CLOUDINARY_CLOUD_NAME", "auracraft")
    monkeypatch.setenv("CLOUDINARY_API_KEY", "986155433124188")
    monkeypatch.setenv("CLOUDINARY_API_SECRET", "V1Z7iiz3dH-JqsgwMwsO1upcBFc")
    monkeypatch.setenv("B2_APPLICATION_KEY_ID", "0032f7e11b6ccef0000000001")
    monkeypatch.setenv("B2_APPLICATION_KEY", "dummy_key")
    monkeypatch.setenv("B2_BUCKET_NAME", "auracraft-studio-vault")

    target = classify_media_storage("avatar_video.mp4", "video/mp4", 50_000_000)
    assert target == "b2"

    target_vrm = classify_media_storage("model.vrm", "application/octet-stream", 15_000_000)
    assert target_vrm == "b2"


def test_upload_asset_local_fallback(monkeypatch):
    monkeypatch.setenv("CLOUDINARY_CLOUD_NAME", "")
    monkeypatch.setenv("B2_APPLICATION_KEY_ID", "")

    sample_data = b"test payload"
    res = upload_asset(io.BytesIO(sample_data), "sample.txt")
    assert res.provider == "local"
    assert res.size_bytes == len(sample_data)
    assert len(res.checksum_sha256) == 64
