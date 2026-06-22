const registry = require('./systemRegistry');

function map(parsed) {
  switch (parsed.type) {
    case 'CREATE_NODE':
      return { action: registry.ENTITY.create, payload: { type: parsed.label || 'generic', name: parsed.name, data: parsed.data || {} } };
    case 'CREATE_RELATIONSHIP':
      return { action: registry.RELATIONSHIP.create, payload: parsed };
    case 'CREATE_ORDER':
      return { action: registry.ORDER.create, payload: parsed };
    case 'CREATE_MESSAGE':
      return { action: registry.MESSAGE.create, payload: parsed };
    case 'CREATE_ROLE':
      return { action: registry.ROLE.create, payload: parsed };
    case 'CREATE_SIGNAL':
      return { action: registry.SIGNAL.create, payload: parsed };
    default:
      throw new Error('Unknown Cypher command mapping');
  }
}

module.exports = { map };
