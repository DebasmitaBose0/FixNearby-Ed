import Geofence from '../models/Geofence.js';
import Worker from '../models/Worker.js';

export const updateGeofence = async (req, res) => {
  try {
    const { radiusKm, centerAddress } = req.body;
    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    const geofence = await Geofence.findOneAndUpdate(
      { worker: worker._id },
      { radiusKm, centerAddress },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, geofence });
  } catch (error) {
    res.status(500).json({ message: 'Error updating geofence', error: error.message });
  }
};

export const getWorkerGeofence = async (req, res) => {
  try {
    const { workerId } = req.params;
    const geofence = await Geofence.findOne({ worker: workerId });
    res.status(200).json({ success: true, geofence: geofence || { radiusKm: 10 } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching geofence', error: error.message });
  }
};

export default {
  updateGeofence,
  getWorkerGeofence
};
