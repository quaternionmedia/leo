from __future__ import annotations

from typing import Optional

from pymongo import MongoClient
from pymongo.database import Database

from leo.config import DB_URL

DEFAULT_TIMEOUT_MS = 5000
DEFAULT_DB_NAME = "leo"

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def _create_client(db_url: str, timeout_ms: int) -> MongoClient:
    return MongoClient(
        db_url,
        connect=False,
        serverSelectionTimeoutMS=timeout_ms,
        connectTimeoutMS=timeout_ms,
    )


def configure(db_url: Optional[str] = None, timeout_ms: int = DEFAULT_TIMEOUT_MS) -> Database:
    """Configure the Mongo client and return the active database."""
    global _client, _db
    url = db_url or DB_URL
    _client = _create_client(url, timeout_ms)
    try:
        _db = _client.get_default_database()
    except Exception:
        _db = _client.get_database(DEFAULT_DB_NAME)
    return _db


def get_db() -> Database:
    """Return the active database, lazily configuring if needed."""
    global _db
    if _db is None:
        configure()
    assert _db is not None
    return _db


# Backwards-compatible alias for existing imports like `from leo.db import db`
class _LazyDb:
    def __getattr__(self, name):
        return getattr(get_db(), name)

    def __getitem__(self, key):
        return get_db()[key]


db: Database = _LazyDb()  # type: ignore[assignment]
