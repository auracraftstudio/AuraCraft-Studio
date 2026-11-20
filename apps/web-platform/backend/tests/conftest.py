import os
import sys
from pathlib import Path
import pytest

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture(autouse=True)
def isolate_test_environment(monkeypatch):
    """Ensure test suite does not inherit developer .env database or restrictive telegram policies."""
    # Prevent tests from polluting or reading live remote database
    monkeypatch.setenv("DATABASE_URL", "")
    monkeypatch.setenv("REQUIRE_DATABASE_URL", "false")
    monkeypatch.setenv("APP_ENV", "test")
    # Allow test Telegram user IDs (7890) so webhook tests pass
    allowed = os.getenv("TELEGRAM_ALLOWED_USER_IDS", "")
    if allowed:
        monkeypatch.setenv("TELEGRAM_ALLOWED_USER_IDS", f"{allowed},7890")
    else:
        monkeypatch.setenv("TELEGRAM_ALLOWED_USER_IDS", "7890")
