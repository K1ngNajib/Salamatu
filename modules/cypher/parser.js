function parse(query) {
  const source = query.trim();

  const createRel = /^CREATE\s*\((\w+)\)\s*-\s*\[:(\w+)\]\s*->\s*\((\w+)\)$/i;
  const createNode = /^CREATE\s*\((\w+)(?::(\w+))?\)$/i;
  const matchNode = /^MATCH\s*\((\w+)\)$/i;
  const createOrder = /^CREATE\s+ORDER\s+"([^"]+)"(?:\s+SET\s+BODY\s+"([^"]*)")?$/i;
  const createMessage = /^CREATE\s+MESSAGE\s+"([^"]+)"(?:\s+CONTENT\s+"([^"]*)")?$/i;
  const createRole = /^CREATE\s+ROLE\s+"([^"]+)"(?:\s+PERMISSIONS\s+(.+))?$/i;
  const createSignal = /^CREATE\s+SIGNAL\s+"([^"]+)"(?:\s+PRIORITY\s+(\w+))?$/i;

  if (createRel.test(source)) {
    const [, from, relation, to] = source.match(createRel);
    return { type: 'CREATE_RELATIONSHIP', from, to, relation };
  }

  if (createNode.test(source)) {
    const [, name, label] = source.match(createNode);
    return { type: 'CREATE_NODE', name, label };
  }

  if (matchNode.test(source)) {
    const [, name] = source.match(matchNode);
    return { type: 'MATCH_NODE', name };
  }

  if (createOrder.test(source)) {
    const [, name, body = ''] = source.match(createOrder);
    return { type: 'CREATE_ORDER', name, body };
  }

  if (createMessage.test(source)) {
    const [, name, content = ''] = source.match(createMessage);
    return { type: 'CREATE_MESSAGE', name, content };
  }

  if (createRole.test(source)) {
    const [, name, permissions = '{}'] = source.match(createRole);
    return { type: 'CREATE_ROLE', name, permissions: JSON.parse(permissions) };
  }

  if (createSignal.test(source)) {
    const [, name, priority = 'HIGH'] = source.match(createSignal);
    return { type: 'CREATE_SIGNAL', name, priority };
  }

  throw new Error('Unsupported or invalid Cypher query');
}

module.exports = { parse };
