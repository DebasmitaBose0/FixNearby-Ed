const JobTelemetry = require('../models/JobTelemetry');
const Booking = require('../models/Booking');

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

exports.checkIn = async (req, res) => {
  try {
    const { bookingId, lat, lng } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const targetLat = booking.location?.coordinates?.[1] || lat;
    const targetLng = booking.location?.coordinates?.[0] || lng;
    const distanceMeters = getHaversineDistance(lat, lng, targetLat, targetLng);

    if (distanceMeters > 500) {
      return res.status(400).json({
        success: false,
        message: `You are ${Math.round(distanceMeters)}m away. You must be within 500m of job location to check in.`
      });
    }

    const telemetry = await JobTelemetry.create({
      bookingId,
      workerId: req.user._id || req.user.id,
      checkInCoordinates: { lat, lng },
      distanceFromTargetMeters: Math.round(distanceMeters)
    });

    booking.status = 'IN_PROGRESS';
    await booking.save();

    res.json({ success: true, data: telemetry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
