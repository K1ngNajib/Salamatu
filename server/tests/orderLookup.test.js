const test = require('node:test');
const assert = require('node:assert/strict');

const { buildOrderLookupQuery } = require('../utils/orderLookup');

test('builds ObjectId-aware query', () => {
  const id = '507f191e810c19729de860ea';
  const query = buildOrderLookupQuery(id);

  assert.ok(query.$or);
  assert.equal(query.$or[0]._id, id);
  assert.equal(query.$or[1].orderId, id);
});

test('builds business order id query for non-ObjectId', () => {
  const query = buildOrderLookupQuery('ORD-12345');
  assert.deepEqual(query, { orderId: 'ORD-12345' });
});

test('throws when identifier is missing', () => {
  assert.throws(() => buildOrderLookupQuery(''));
});
