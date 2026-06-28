const VALID_CATEGORIES = [
  'Traffic Light', 'Pothole', 'Street Light', 'Sidewalk',
  'Drainage', 'Graffiti', 'Litter', 'Other'
];

const VALID_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

export function validateCoordinates(lat, lng) {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return { valid: false, message: 'Invalid coordinate values' };
  }
  if (parsedLat < -90 || parsedLat > 90) {
    return { valid: false, message: 'Latitude must be between -90 and 90' };
  }
  if (parsedLng < -180 || parsedLng > 180) {
    return { valid: false, message: 'Longitude must be between -180 and 180' };
  }
  return { valid: true, data: { latitude: parsedLat, longitude: parsedLng } };
}

export const validateCreateIssue = (req, res, next) => {
  const { title, description, category, latitude, longitude } = req.body;

  if (!title || !description || !category || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: title, description, category, latitude, and longitude'
    });
  }

  if (typeof title !== 'string' || title.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Title must be at least 5 characters'
    });
  }

  if (title.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Title must be less than 200 characters'
    });
  }

  if (typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Description must be at least 10 characters'
    });
  }

  if (description.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Description must be less than 2000 characters'
    });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}`
    });
  }

  const coordCheck = validateCoordinates(latitude, longitude);
  if (!coordCheck.valid) {
    return res.status(400).json({ success: false, message: coordCheck.message });
  }

  next();
};

export const validateIssueStatusUpdate = (req, res, next) => {
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`
    });
  }

  next();
};

export const validateNearbyIssuesQuery = (req, res, next) => {
  const lat = parseFloat(req.query.latitude || req.query.lat);
  const lng = parseFloat(req.query.longitude || req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ message: 'Valid coordinates are required (latitude and longitude)' });
  }

  if (req.query.radius) {
    const radius = parseFloat(req.query.radius);
    if (isNaN(radius) || radius <= 0 || radius > 50) {
      return res.status(400).json({ message: 'Radius must be between 0 and 50 km' });
    }
  }

  next();
};
