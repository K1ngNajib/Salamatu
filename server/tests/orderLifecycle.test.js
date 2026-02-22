const test = require('node:test');
const assert = require('node:assert/strict');

const { canTransitionOrderStatus } = require('../utils/orderLifecycle');

test('allows Draft -> Published', () => {
  assert.equal(canTransitionOrderStatus('Draft', 'Published'), true);
});

test('blocks Archived -> Published', () => {
  assert.equal(canTransitionOrderStatus('Archived', 'Published'), false);
});

test('allows Acknowledged -> Archived', () => {
  assert.equal(canTransitionOrderStatus('Acknowledged', 'Archived'), true);
});

test('blocks Published -> Draft rollback', () => {
  assert.equal(canTransitionOrderStatus('Published', 'Draft'), false);
});
