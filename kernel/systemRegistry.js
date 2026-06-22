const registry = {
  ENTITY: { create: 'createEntity', get: 'getEntity', update: 'updateEntity', delete: 'deleteEntity' },
  MESSAGE: { create: 'createMessage', send: 'createEntity' },
  ORDER: { create: 'createOrder', acknowledge: 'updateEntity' },
  ROLE: { create: 'createRole', assign: 'updateEntity' },
  SIGNAL: { create: 'createSignal' },
  RELATIONSHIP: { create: 'createRelationship' },
};

module.exports = registry;
