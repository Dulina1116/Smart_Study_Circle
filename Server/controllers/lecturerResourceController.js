import LecturerResource from '../models/LecturerResource.js'

export const getResources = async (req, res) => {
  try {
    const resources = await LecturerResource.find({ uploader: req.user._id }).sort('-createdAt');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
}

export const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, module, visibility } = req.body;
    
    const newResource = await LecturerResource.create({
      title: title || req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
      visibility: visibility || 'Students',
      module,
      uploader: req.user._id
    });

    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading resource', error: error.message });
  }
}

export const getTopResources = async (req, res) => {
  try {
    const resources = await LecturerResource.find({ uploader: req.user._id }).sort('-createdAt').limit(5);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
}

export const updateResource = async (req, res) => {
  try {
    const { title, module, type, tags, description } = req.body;
    const resource = await LecturerResource.findOneAndUpdate(
      { _id: req.params.id, uploader: req.user._id },
      { title, module, type, tags, description },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource', error: error.message });
  }
}

export const deleteResource = async (req, res) => {
  try {
    const resource = await LecturerResource.findOneAndDelete({ _id: req.params.id, uploader: req.user._id });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    // Note: In production you might want to also delete the physical file using fs.unlink
    res.json({ message: 'Resource removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource', error: error.message });
  }
}
