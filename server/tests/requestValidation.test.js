const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateOrderPayload,
  validateSignalPayload,
} = require('../middleware/requestValidation');

const createRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return {
      json: (body) => {
        res.body = body;
        return res;
      },
    };
  };
  return res;
};

test('validateOrderPayload rejects invalid recipients', () => {
  const req = { body: { title: 'a', body: 'b', signature: 's', recipients: ['bad-id'] } };
  const res = createRes();
  let nextCalled = false;

  validateOrderPayload(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
});

test('validateSignalPayload accepts valid payload', () => {
  const req = { body: { message: 'urgent', recipients: ['507f191e810c19729de860ea'] } };
  const res = createRes();
  let nextCalled = false;

  validateSignalPayload(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});
