const mongoose = require('mongoose');

/**
 * Centralized request validation helpers used by route handlers.
 * These helpers keep validation rules documented and consistent.
 */
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const areValidObjectIds = (values) => Array.isArray(values) && values.length > 0 && values.every((value) => isValidObjectId(value));

module.exports = {
  isNonEmptyString,
  isValidObjectId,
  areValidObjectIds,
};
