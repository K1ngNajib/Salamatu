import CryptoJS from 'crypto-js';
import { JSEncrypt } from 'jsencrypt';

export const signPayload = (payload, privateKey) => {
  const signer = new JSEncrypt();
  signer.setPrivateKey(privateKey);
  return signer.sign(payload, CryptoJS.SHA256, 'sha256');
};

export const verifyPayloadSignature = (payload, signature, publicKey) => {
  const verifier = new JSEncrypt();
  verifier.setPublicKey(publicKey);
  return verifier.verify(payload, signature, CryptoJS.SHA256);
};
