
import sqlite3
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

DATABASE_PATH = Path(__file__).resolve().parent.parent / "bayora.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS test_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                team TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'created',
                created_at TEXT NOT NULL
            )
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT NOT NULL,
                details TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                event_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


def add_audit_log(event, details):
    with get_connection() as connection:
        previous = connection.execute(
            "SELECT event_hash FROM audit_logs ORDER BY id DESC LIMIT 1"
        ).fetchone()

        previous_hash = previous["event_hash"] if previous else "GENESIS"

        created_at = datetime.now(timezone.utc).isoformat()
        details_json = json.dumps(details, sort_keys=True)

        content = (
            previous_hash
            + event
            + details_json
            + created_at
        )

        event_hash = hashlib.sha256(
            content.encode("utf-8")
        ).hexdigest()

        connection.execute("""
            INSERT INTO audit_logs
            (event, details, previous_hash, event_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            event,
            details_json,
            previous_hash,
            event_hash,
            created_at
        ))

        return event_hash


def create_test_session(title, team):
    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        cursor = connection.execute("""
            INSERT INTO test_sessions (title, team, status, created_at)
            VALUES (?, ?, 'created', ?)
        """, (title, team, created_at))

        session_id = cursor.lastrowid

    add_audit_log(
        "test_session_created",
        {
            "session_id": session_id,
            "title": title,
            "team": team
        }
    )

    return get_test_session(session_id)


def get_test_session(session_id):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM test_sessions WHERE id = ?",
            (session_id,)
        ).fetchone()

        return dict(row) if row else None


def list_test_sessions():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM test_sessions ORDER BY id DESC"
        ).fetchall()

        return [dict(row) for row in rows]


def list_audit_logs():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM audit_logs ORDER BY id DESC"
        ).fetchall()

        return [dict(row) for row in rows]
    
def verify_audit_chain():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM audit_logs ORDER BY id ASC"
        ).fetchall()

    previous_hash = "GENESIS"

    for row in rows:
        if row["previous_hash"] != previous_hash:
            return {
                "valid": False,
                "failed_event_id": row["id"],
                "reason": "Previous hash does not match."
            }

        details = json.loads(row["details"])
        details_json = json.dumps(details, sort_keys=True)

        content = (
            previous_hash
            + row["event"]
            + details_json
            + row["created_at"]
        )

        calculated_hash = hashlib.sha256(
            content.encode("utf-8")
        ).hexdigest()

        if calculated_hash != row["event_hash"]:
            return {
                "valid": False,
                "failed_event_id": row["id"],
                "reason": "Event data may have been modified."
            }

        previous_hash = row["event_hash"]

    return {
        "valid": True,
        "verified_events": len(rows),
        "message": "Audit hash chain is valid."
    }

