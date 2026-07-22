const Accreditation = require('../models/Accreditation');

exports.addAccreditation = async (req, res) => {
  try {
    const { title, issuingBody, credentialId, issueDate, expiryDate, documentUrl } = req.body;
    const accreditation = await Accreditation.create({
      workerId: req.user._id || req.user.id,
      title,
      issuingBody,
      credentialId,
      issueDate,
      expiryDate,
      documentUrl
    });
    res.status(201).json({ success: true, data: accreditation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWorkerAccreditations = async (req, res) => {
  try {
    const accreditations = await Accreditation.find({ workerId: req.params.workerId });
    res.json({ success: true, data: accreditations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
