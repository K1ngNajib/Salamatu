const test = require('node:test');
const assert = require('node:assert/strict');

const { isNonEmptyString, isValidObjectId, areValidObjectIds } = require('../utils/validation');

test('isNonEmptyString validates trimmed strings', () => {
  assert.equal(isNonEmptyString('directive'), true);
  assert.equal(isNonEmptyString('   '), false);
});

test('isValidObjectId detects invalid values', () => {
  assert.equal(isValidObjectId('507f191e810c19729de860ea'), true);
  assert.equal(isValidObjectId('invalid-id'), false);
});

test('areValidObjectIds requires non-empty arrays', () => {
  assert.equal(areValidObjectIds(['507f191e810c19729de860ea']), true);
  assert.equal(areValidObjectIds([]), false);
  assert.equal(areValidObjectIds(['bad-id']), false);
});
