const test = require('node:test');
const assert = require('node:assert/strict');
const { getSocketErrorPayload } = require('../utils/socketError');

test('maps authorization errors to FORBIDDEN', () => {
  const payload = getSocketErrorPayload(new Error('AuthorizationError: Sender mismatch'), 'send');
  assert.deepEqual(payload, {
    action: 'send',
    code: 'FORBIDDEN',
    message: 'Sender mismatch',
  });
});

test('maps validation errors to BAD_REQUEST', () => {
  const payload = getSocketErrorPayload(new Error('ValidationError: Invalid recipient identifier'), 'send');
  assert.equal(payload.code, 'BAD_REQUEST');
  assert.equal(payload.message, 'Invalid recipient identifier');
});

test('maps not found errors to NOT_FOUND', () => {
  const payload = getSocketErrorPayload(new Error('NotFoundError: Message not found'), 'recall');
  assert.equal(payload.code, 'NOT_FOUND');
  assert.equal(payload.action, 'recall');
});
