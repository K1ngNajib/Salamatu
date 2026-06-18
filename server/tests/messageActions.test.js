const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseMessageExpiry,
  validateMessagePayload,
  validateRecallRequest,
} = require('../utils/messageActions');

test('parseMessageExpiry rejects invalid expiry date', () => {
  assert.throws(() => parseMessageExpiry('invalid-date'), /Invalid expiry timestamp/);
});

test('validateMessagePayload accepts authorized official message', () => {
  const payload = validateMessagePayload({
    payload: {
      sender: '507f191e810c19729de860ea',
      msgByUserId: '507f191e810c19729de860ea',
      receiver: '507f191e810c19729de860eb',
      textForSender: 'cipher',
      textForRecipient: 'cipher',
      isOfficial: true,
    },
    actor: { _id: '507f191e810c19729de860ea', role: 'command_admin' },
  });

  assert.equal(payload.isOfficial, true);
});

test('validateMessagePayload blocks unauthorized official message', () => {
  assert.throws(() => validateMessagePayload({
    payload: {
      sender: '507f191e810c19729de860ea',
      msgByUserId: '507f191e810c19729de860ea',
      receiver: '507f191e810c19729de860eb',
      textForSender: 'cipher',
      textForRecipient: 'cipher',
      isOfficial: true,
    },
    actor: { _id: '507f191e810c19729de860ea', role: 'personnel' },
  }), /not allowed to send official messages/);
});

test('validateRecallRequest requires original author and unrecalled message', () => {
  assert.throws(() => validateRecallRequest({
    messageId: '507f191e810c19729de860ea',
    actorId: '507f191e810c19729de860ea',
    message: { msgByUserId: '507f191e810c19729de860eb' },
  }), /Cannot recall a message from another user/);
});
