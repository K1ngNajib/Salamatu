const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertSafeRegistrationRole,
  assertCanUpdateRole,
} = require('../utils/roleSecurity');

test('registration blocks privileged role assignment', () => {
  assert.throws(() => assertSafeRegistrationRole('super_admin'), /Role assignment is restricted/);
});

test('registration allows default personnel role', () => {
  assert.doesNotThrow(() => assertSafeRegistrationRole('personnel'));
  assert.doesNotThrow(() => assertSafeRegistrationRole(undefined));
});

test('non-super-admin cannot change role', () => {
  assert.throws(() => assertCanUpdateRole({
    actorRole: 'personnel',
    requestedRole: 'command_admin',
    currentRole: 'personnel',
  }), /Only super admins can change user roles/);
});

test('super-admin can change role', () => {
  assert.doesNotThrow(() => assertCanUpdateRole({
    actorRole: 'super_admin',
    requestedRole: 'observer',
    currentRole: 'personnel',
  }));
});
