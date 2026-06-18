const test = require('node:test');
const assert = require('node:assert/strict');

const { getHttpStatusFromError } = require('../utils/httpError');

test('maps not found to 404', () => {
  assert.equal(getHttpStatusFromError('Order not found'), 404);
});

test('maps authorization errors to 403', () => {
  assert.equal(getHttpStatusFromError('Only recipients can acknowledge this order'), 403);
});

test('maps validation errors to 400', () => {
  assert.equal(getHttpStatusFromError('Invalid status transition from Draft to Draft'), 400);
});
