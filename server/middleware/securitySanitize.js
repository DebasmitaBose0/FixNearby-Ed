export const sanitizeInput = (req, res, next) => {
  const cleanData = (data) => {
    if (typeof data === 'string') {
      return data.replace(/[<>]/g, '');
    }
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (key.startsWith('$') || key.includes('.')) {
          delete data[key];
        } else {
          data[key] = cleanData(data[key]);
        }
      }
    }
    return data;
  };

  if (req.body) req.body = cleanData(req.body);
  if (req.query) req.query = cleanData(req.query);
  if (req.params) req.params = cleanData(req.params);
  next();
};