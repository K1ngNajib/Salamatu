const db = require('../../storage/db');

const context = {};

async function execute(parsed) {
  switch (parsed.type) {
    case 'CREATE_NODE': {
      const id = db.createEntity({ type: parsed.label || 'node', name: parsed.name, data: {} });
      context[parsed.name] = id;
      return { success: true, id };
    }
    case 'CREATE_RELATIONSHIP': {
      const fromId = context[parsed.from] || db.findEntityByName(parsed.from)?.id;
      const toId = context[parsed.to] || db.findEntityByName(parsed.to)?.id;
      if (!fromId || !toId) throw new Error('Undefined node reference');
      const relationship = db.createRelationship({ from_id: fromId, to_id: toId, relation: parsed.relation, data: {} });
      return { success: true, relationship };
    }
    case 'MATCH_NODE': {
      const id = context[parsed.name];
      return id ? db.getEntity(id) : db.findEntityByName(parsed.name);
    }
    default:
      throw new Error('Unknown execution type');
  }
}

module.exports = { execute, context };
