import ZoneMatchingService from '../services/zoneMatchingService.js';

export const addZone = async (req, res) => {
  try {
    const workerId = req.user ? req.user.id : req.body.workerId;
    const zone = await ZoneMatchingService.createZone(workerId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Service coverage zone added.',
      data: zone,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getZones = async (req, res) => {
  try {
    const workerId = req.params.workerId || (req.user && req.user.id);
    const zones = await ZoneMatchingService.getWorkerZones(workerId);
    return res.status(200).json({
      success: true,
      data: zones,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkCoverage = async (req, res) => {
  try {
    const { workerId, lat, lon } = req.query;
    const result = await ZoneMatchingService.isLocationCoveredByWorker(workerId, Number(lat), Number(lon));
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
