const { parse } = require('./parser');
const { execute } = require('./executor');
const db = require('../../storage/db');

async function run(query) {
  try {
    const parsed = parse(query);
    const result = await execute(parsed);
    db.logCommand({ command: query, result: JSON.stringify(result), status: 'SUCCESS' });
    return result;
  } catch (err) {
    db.logCommand({ command: query, result: err.message, status: 'ERROR' });
    return { success: false, error: err.message };
  }
}

module.exports = { run };
