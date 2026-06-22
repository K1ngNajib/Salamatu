const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('local SQLite storage creates entities and relationships', () => {
  const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'commandlink-storage-')), 'commandlink.db');
  process.env.COMMANDLINK_DB_PATH = dbPath;
  delete require.cache[require.resolve('../../storage/db')];
  const db = require('../../storage/db');

  const hq = db.createEntity({ type: 'unit', name: 'HQ', data: { level: 1 } });
  const unit = db.createEntity({ type: 'unit', name: 'Unit 1', data: { level: 2 } });
  const relationship = db.createRelationship({ from_id: hq, to_id: unit, relation: 'CONTROLS', data: { active: true } });

  assert.equal(db.getEntity(hq).name, 'HQ');
  assert.equal(db.getEntity(unit).data.level, 2);
  assert.ok(relationship);
  assert.equal(db.listRelationships('CONTROLS').length, 1);
});
