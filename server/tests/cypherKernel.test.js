const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('cypher kernel executes CommandLink system commands against local storage', async () => {
  const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'commandlink-kernel-')), 'commandlink.db');
  process.env.COMMANDLINK_DB_PATH = dbPath;
  for (const modulePath of ['../../storage/db', '../../modules/cypher/parser', '../../kernel/commandMapper', '../../kernel/cypherKernel']) {
    delete require.cache[require.resolve(modulePath)];
  }

  const { executeCypher } = require('../../kernel/cypherKernel');
  const db = require('../../storage/db');

  const order = await executeCypher('CREATE ORDER "Mission Brief" SET BODY "All units standby"');
  const role = await executeCypher('CREATE ROLE "UnitAdmin" PERMISSIONS { "send_orders": true }');
  const signal = await executeCypher('CREATE SIGNAL "URGENT ALERT" PRIORITY HIGH');

  assert.equal(order.success, true);
  assert.equal(role.success, true);
  assert.equal(signal.success, true);
  assert.equal(db.listEntities('order')[0].data.status, 'DRAFT');
  assert.equal(db.listEntities('role')[0].data.send_orders, true);
  assert.equal(db.listEntities('signal')[0].data.priority, 'HIGH');
});
