/**
 * Maps domain/service error messages to clearer HTTP status codes.
 */
const getHttpStatusFromError = (errorMessage = '') => {
  if (errorMessage.includes('not found')) return 404;
  if (errorMessage.includes('Only ') || errorMessage.includes('Forbidden')) return 403;
  if (errorMessage.includes('Invalid') || errorMessage.includes('Missing') || errorMessage.includes('must be')) return 400;

  return 400;
};

module.exports = { getHttpStatusFromError };
