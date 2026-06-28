/**
 * Recursively removes keys starting with $ or containing dots to prevent NoSQL query injection attacks.
 */
const clean = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        clean(obj[key]);
      }
    }
  }
  return obj;
};

export const sanitizeRequests = (req, res, next) => {
  req.body = clean(req.body);
  req.query = clean(req.query);
  req.params = clean(req.params);
  next();
};

function stripXSS(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/['";$]/g, '');
}

export const sanitizeInput = (req, res, next) => {
  const cleanData = (data) => {
    if (typeof data === 'string') {
      return stripXSS(data);
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

export const sanitizeFileUpload = (req, res, next) => {
  if (req.file) {
    req.file.originalname = stripXSS(req.file.originalname);
    req.file.filename = stripXSS(req.file.filename);
  }
  if (req.files) {
    for (const file of req.files) {
      file.originalname = stripXSS(file.originalname);
      file.filename = stripXSS(file.filename);
    }
  }
  next();
};
