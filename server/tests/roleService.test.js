const test = require('node:test');
const assert = require('node:assert/strict');

const { hasPermission } = require('../services/roleService');

test('super admin can manage roles', () => {
  assert.equal(hasPermission('super_admin', 'manage_roles'), true);
});

test('observer cannot issue directives', () => {
  assert.equal(hasPermission('observer', 'issue_directives'), false);
});

test('role checks are case-insensitive', () => {
  assert.equal(hasPermission('Command_Admin', 'publish_circulars'), true);
});

test('officer can create rooms', () => {
  assert.equal(hasPermission('officer', 'create_rooms'), true);
});
