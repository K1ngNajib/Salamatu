const mongoose = require('mongoose');

const buildOrderLookupQuery = (identifier) => {
  if (!identifier) {
    throw new Error('Order identifier is required');
  }

  if (mongoose.Types.ObjectId.isValid(identifier)) {
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
