export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "connect-src 'self' http://localhost:5000 https://api.fixnearby.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  res.setHeader('Content-Security-Policy', csp.join('; '));

  const cspReportOnly = [
    "default-src 'self'",
    "script-src 'self'",
    "report-uri /api/csp-violation"
  ];
  res.setHeader('Content-Security-Policy-Report-Only', cspReportOnly.join('; '));

  if (req.protocol === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  res.setHeader('Permissions-Policy',
    'geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=()'
  );

  res.removeHeader('X-Powered-By');

  next();
};

export const csrfHeaderCheck = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const csrfHeader = req.headers['x-csrf-token'] || req.headers['xsrf-token'];
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];

  if (origin) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    try {
      const originUrl = new URL(origin);
      if (!allowedOrigins.some(a => a.includes(originUrl.hostname))) {
        return res.status(403).json({
          success: false,
          message: 'Cross-origin request blocked'
        });
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid origin header'
      });
    }
  }

  if (!csrfHeader && !origin) {
    if (!referer || !referer.includes(req.hostname)) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token missing or invalid referer'
      });
    }
  }

  next();
};
