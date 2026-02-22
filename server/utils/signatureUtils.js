const crypto = require('crypto');

const verifySignature = ({ payload, signature, publicKey }) => {
  if (!payload || !signature || !publicKey) {
    return false;
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(payload);
  verifier.end();

  return verifier.verify(publicKey, signature, 'base64');
};

module.exports = {
  verifySignature,
};
