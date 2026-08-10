export const validateBoundingBox = (box) => {
  return Array.isArray(box) && box.length === 2;
};
