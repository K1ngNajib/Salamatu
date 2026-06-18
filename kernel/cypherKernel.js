const { parse } = require('../modules/cypher/parser');
const { map } = require('./commandMapper');
const db = require('../storage/db');

async function executeCypher(query) {
  try {
    const parsed = parse(query);
    const mapped = map(parsed);
    let result;

    switch (mapped.action) {
      case 'createEntity':
        result = db.createEntity(mapped.payload);
        break;
      case 'getEntity':
        result = db.getEntity(mapped.payload.id);
        break;
      case 'createRelationship': {
        const from = db.findEntityByName(mapped.payload.from);
        const to = db.findEntityByName(mapped.payload.to);
        if (!from || !to) throw new Error('Undefined node reference');
        result = db.createRelationship({ from_id: from.id, to_id: to.id, relation: mapped.payload.relation, data: {} });
        break;
      }
      case 'createOrder':
        result = db.createEntity({ type: 'order', name: mapped.payload.name, data: { body: mapped.payload.body, status: 'DRAFT', acknowledgements: [] } });
        break;
      case 'createMessage':
        result = db.createEntity({ type: 'message', name: mapped.payload.name, data: { content: mapped.payload.content, timestamp: Date.now() } });
        break;
      case 'createRole':
        result = db.createEntity({ type: 'role', name: mapped.payload.name, data: mapped.payload.permissions || {} });
        break;
      case 'createSignal':
        result = db.createEntity({ type: 'signal', name: mapped.payload.name, data: { priority: mapped.payload.priority || 'HIGH', acknowledged: false } });
        break;
      default:
        throw new Error('Unhandled system action');
    }

    db.logCommand({ command: query, result: JSON.stringify(result), status: 'SUCCESS' });
    return { success: true, result };
  } catch (err) {
    db.logCommand({ command: query, result: err.message, status: 'ERROR' });
    return { success: false, error: err.message };
  }
}

module.exports = { executeCypher };
