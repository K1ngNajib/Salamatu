const ROLE_PERMISSIONS = {
  super_admin: ['manage_roles', 'issue_directives', 'publish_circulars', 'broadcast_announcements', 'create_rooms'],
  command_admin: ['issue_directives', 'publish_circulars', 'broadcast_announcements', 'create_rooms'],
  unit_admin: ['issue_directives', 'broadcast_announcements', 'create_rooms'],
  officer: ['create_rooms'],
  personnel: [],
  observer: [],
};

const hasPermission = (role, permission) => {
  const normalizedRole = (role || 'personnel').toLowerCase();
  return ROLE_PERMISSIONS[normalizedRole]?.includes(permission) || false;
};

module.exports = {
  hasPermission,
  ROLE_PERMISSIONS,
};
