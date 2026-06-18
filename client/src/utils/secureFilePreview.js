export const createSecureFilePreview = (file) => {
  if (!file) {
    return null;
  }

  return URL.createObjectURL(file);
};

export const revokeSecureFilePreview = (previewUrl) => {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
};
