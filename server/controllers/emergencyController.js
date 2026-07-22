const EmergencyRequest = require('../models/EmergencyRequest');

exports.createEmergencyBroadcast = async (req, res) => {
  try {
    const { emergencyCategory, description, broadcastRadiusKm } = req.body;
    const request = await EmergencyRequest.create({
      userId: req.user._id || req.user.id,
      emergencyCategory,
      description,
      broadcastRadiusKm: broadcastRadiusKm || 5
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.claimEmergencyJob = async (req, res) => {
  try {
    const request = await EmergencyRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'BROADCASTING' },
      { status: 'ACCEPTED', assignedWorkerId: req.user._id || req.user.id },
      { new: true }
    );
    if (!request) {
      return res.status(400).json({ success: false, message: 'Job no longer available' });
    }
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
