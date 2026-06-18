const { isValidObjectId } = require('./validation');

const buildOrderLookupQuery = (identifier) => {
  if (!identifier) {
    throw new Error('Order identifier is required');
  }

  if (isValidObjectId(identifier)) {
    return {
      $or: [
        { _id: identifier },
        { orderId: identifier },
      ],
    };
  }

  return { orderId: identifier };
};

module.exports = {
  buildOrderLookupQuery,
};
