import mongoose from 'mongoose';

const VALID_AVAILABILITY_STATUSES = ['available', 'busy', 'offline'];

export function validateWorkerRegistrationInput(req, res, next) {
  const { name, email, password, category, experience, location, contact, bio } = req.body;

  if (!name || !email || !password || !category || !experience || !location || !contact || !bio) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: name, email, password, category, experience, location, contact, bio'
    });
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  if (typeof category !== 'string' || category.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Category is required' });
  }

  if (typeof experience !== 'string' || experience.trim().length < 1) {
    return res.status(400).json({ success: false, message: 'Experience description is required' });
  }

  if (typeof contact !== 'string' || contact.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Valid contact information is required' });
  }

  if (typeof bio !== 'string' || bio.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Bio must be at least 10 characters' });
  }

  if (bio.length > 2000) {
    return res.status(400).json({ success: false, message: 'Bio must be less than 2000 characters' });
  }

  next();
}

export function validateNearbyWorkersQuery(req, res, next) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both lat (latitude) and lng (longitude) query parameters'
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid latitude or longitude coordinates'
    });
  }

  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({ success: false, message: 'Latitude must be between -90 and 90' });
  }

  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({ success: false, message: 'Longitude must be between -180 and 180' });
  }

  if (req.query.maxDistance) {
    const maxDist = parseFloat(req.query.maxDistance);
    if (isNaN(maxDist) || maxDist <= 0 || maxDist > 50000) {
      return res.status(400).json({ success: false, message: 'maxDistance must be between 1 and 50000 meters' });
    }
  }

  if (req.query.category && typeof req.query.category !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid category parameter' });
  }

  if (req.query.availabilityStatus && !VALID_AVAILABILITY_STATUSES.includes(req.query.availabilityStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid availability status. Allowed: ${VALID_AVAILABILITY_STATUSES.join(', ')}`
    });
  }

  next();
}

export function validateWorkerIdParam(req, res, next) {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid worker ID' });
  }

  next();
}
