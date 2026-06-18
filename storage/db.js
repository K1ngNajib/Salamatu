const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = process.env.COMMANDLINK_DB_PATH || path.join(DATA_DIR, 'commandlink.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function quote(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function formatSql(sql, params = []) {
  let index = 0;
  return sql.replace(/\?/g, () => quote(params[index++]));
}

function runSql(sql, params = []) {
  const statement = formatSql(sql.trim(), params);
  const output = execFileSync('sqlite3', ['-json', DB_PATH, statement], { encoding: 'utf8' }).trim();
  return output ? JSON.parse(output) : [];
}

function init() {
  execFileSync('sqlite3', [DB_PATH], { input: fs.readFileSync(SCHEMA_PATH, 'utf8') });
}

const generateId = () => crypto.randomUUID();

function encodeData(data) {
  return JSON.stringify(data || {});
}

function parseRow(row) {
  if (!row) return null;
  return {
    ...row,
    data: JSON.parse(row.data || '{}'),
  };
}

function createEntity({ type, name, data }) {
  const id = generateId();
  runSql('INSERT INTO entities (id, type, name, data) VALUES (?, ?, ?, ?);', [id, type, name, encodeData(data)]);
  return id;
}

function getEntity(id) {
  const [row] = runSql('SELECT * FROM entities WHERE id = ? LIMIT 1;', [id]);
  return parseRow(row);
}

function findEntityByName(name) {
  const [row] = runSql('SELECT * FROM entities WHERE name = ? ORDER BY created_at DESC LIMIT 1;', [name]);
  return parseRow(row);
}

function listEntities(type) {
  const rows = type
    ? runSql('SELECT * FROM entities WHERE type = ? ORDER BY created_at ASC;', [type])
    : runSql('SELECT * FROM entities ORDER BY created_at ASC;');
  return rows.map(parseRow);
}

function updateEntity(id, { type, name, data }) {
  const current = getEntity(id);
  if (!current) return null;
  const next = {
    type: type ?? current.type,
    name: name ?? current.name,
    data: data ?? current.data,
  };
  runSql('UPDATE entities SET type = ?, name = ?, data = ? WHERE id = ?;', [next.type, next.name, encodeData(next.data), id]);
  return getEntity(id);
}

function deleteEntity(id) {
  runSql('DELETE FROM relationships WHERE from_id = ? OR to_id = ?;', [id, id]);
  runSql('DELETE FROM entities WHERE id = ?;', [id]);
  return true;
}

function logCommand({ command, result, status }) {
  const id = generateId();
  runSql('INSERT INTO commands (id, command, result, status) VALUES (?, ?, ?, ?);', [id, command, result, status]);
  return id;
}

function createRelationship({ from_id, to_id, relation, data }) {
  const id = generateId();
  runSql('INSERT INTO relationships (id, from_id, to_id, relation, data) VALUES (?, ?, ?, ?, ?);', [id, from_id, to_id, relation, encodeData(data)]);
  return id;
}

function listRelationships(relation) {
  const rows = relation
    ? runSql('SELECT * FROM relationships WHERE relation = ? ORDER BY created_at ASC;', [relation])
    : runSql('SELECT * FROM relationships ORDER BY created_at ASC;');
  return rows.map(parseRow);
}

init();

module.exports = {
  DB_PATH,
  createEntity,
  getEntity,
  findEntityByName,
  listEntities,
  updateEntity,
  deleteEntity,
  logCommand,
  createRelationship,
  listRelationships,
};
