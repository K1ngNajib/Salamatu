/**
 * Convert internal errors into a safe, structured socket error payload.
 */
const getSocketErrorPayload = (error = new Error('Unknown error'), action = 'unknown') => {
  const rawMessage = (error?.message || 'Unknown error').trim();

  if (rawMessage.startsWith('AuthorizationError:')) {
    return {
      action,
      code: 'FORBIDDEN',
      message: rawMessage.replace('AuthorizationError:', '').trim(),
    };
  }

  if (rawMessage.startsWith('ValidationError:')) {
    return {
      action,
      code: 'BAD_REQUEST',
      message: rawMessage.replace('ValidationError:', '').trim(),
    };
  }

  if (rawMessage.startsWith('NotFoundError:')) {
    return {
      action,
      code: 'NOT_FOUND',
      message: rawMessage.replace('NotFoundError:', '').trim(),
    };
  }

  return {
    action,
    code: 'BAD_REQUEST',
    message: rawMessage || 'Request failed',
  };
};

module.exports = {
  getSocketErrorPayload,
};
