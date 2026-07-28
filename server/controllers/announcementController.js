const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().populate('author', 'fullName').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    next(error);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetAudience, priority } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      targetAudience: targetAudience || 'All',
      priority: priority || 'Normal',
      author: req.user._id
    });
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};
