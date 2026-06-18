/**
 * Centralized request validation helpers used by route handlers.
 * These helpers keep validation rules documented and consistent with local-first IDs.
 */
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidObjectId = (value) => {
  if (typeof value !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(value) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const areValidObjectIds = (values) => Array.isArray(values) && values.length > 0 && values.every((value) => isValidObjectId(value));

module.exports = {
  isNonEmptyString,
  isValidObjectId,
  areValidObjectIds,
};
