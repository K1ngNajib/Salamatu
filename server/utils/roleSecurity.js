const PRIVILEGED_ROLES = new Set(['super_admin', 'command_admin', 'unit_admin', 'officer']);

/**
 * Public registration must not mint privileged users.
 */
const assertSafeRegistrationRole = (requestedRole) => {
  if (!requestedRole || requestedRole === 'personnel') return;

  if (PRIVILEGED_ROLES.has(requestedRole) || requestedRole === 'observer') {
    throw new Error('AuthorizationError: Role assignment is restricted to super admins');
  }
};

/**
 * Only super admins can modify role fields.
 */
const assertCanUpdateRole = ({ actorRole, requestedRole, currentRole }) => {
  if (!requestedRole || requestedRole === currentRole) return;

  if (actorRole !== 'super_admin') {
    throw new Error('AuthorizationError: Only super admins can change user roles');
  }
};

module.exports = {
  assertSafeRegistrationRole,
  assertCanUpdateRole,
};
