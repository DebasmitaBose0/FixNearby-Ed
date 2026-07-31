export const handleUploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = {
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };

    res.status(200).json({
      success: true,
      attachment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing upload', error: error.message });
  }
};

export default {
  handleUploadAttachment
};
