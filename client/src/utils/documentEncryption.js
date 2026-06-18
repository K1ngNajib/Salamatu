import CryptoJS from 'crypto-js';

export const encryptDocumentContent = (plainContent, key) => {
  return CryptoJS.AES.encrypt(plainContent, key).toString();
};

export const decryptDocumentContent = (encryptedContent, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
