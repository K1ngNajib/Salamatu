import json
import os
import sqlite3
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.environ.get("COMMANDLINK_DB_PATH", os.path.join(BASE_DIR, "data", "commandlink.db"))
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

with open(SCHEMA_PATH, "r", encoding="utf-8") as schema_file:
    cursor.executescript(schema_file.read())
    conn.commit()

def generate_id():
    return str(uuid.uuid4())

def create_entity(type_, name, data):
    entity_id = generate_id()
    cursor.execute(
        "INSERT INTO entities (id, type, name, data) VALUES (?, ?, ?, ?)",
        (entity_id, type_, name, json.dumps(data or {})),
    )
    conn.commit()
    return entity_id

def get_entity(entity_id):
    row = cursor.execute("SELECT * FROM entities WHERE id = ?", (entity_id,)).fetchone()
    if row is None:
        return None
    result = dict(row)
    result["data"] = json.loads(result.get("data") or "{}")
    return result
