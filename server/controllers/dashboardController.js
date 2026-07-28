const User = require('../models/User');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Announcement = require('../models/Announcement');

// @desc    Get Dashboard Overview Data based on User Role
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const totalSubjects = await Subject.countDocuments();
      const totalExams = await Exam.countDocuments();
      const totalQuestions = await Question.countDocuments();
      const totalSubmissions = await Result.countDocuments();

      const recentResults = await Result.find()
        .populate('student', 'fullName dsNumber class')
        .populate({ path: 'exam', populate: { path: 'subject', select: 'name' } })
        .sort({ submittedAt: -1 })
        .limit(5);

      const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(3);

      return res.status(200).json({
        success: true,
        stats: {
          totalStudents,
          totalTeachers,
          totalSubjects,
          totalExams,
          totalQuestions,
          totalSubmissions
        },
        recentResults,
        announcements
      });
    }

    if (role === 'teacher') {
      const assignedSubjectsCount = req.user.assignedSubjects ? req.user.assignedSubjects.length : 0;
      const activeExams = await Exam.countDocuments({ createdBy: req.user._id, status: 'published' });
      const totalExams = await Exam.countDocuments({ createdBy: req.user._id });
      const totalQuestionsCreated = await Question.countDocuments({ createdBy: req.user._id });

      const announcements = await Announcement.find({ targetAudience: { $in: ['All', 'Teachers'] } })
        .sort({ createdAt: -1 })
        .limit(3);

      return res.status(200).json({
        success: true,
        stats: {
          assignedSubjectsCount,
          activeExams,
          totalExams,
          totalQuestionsCreated
        },
        announcements
      });
    }

    if (role === 'student') {
      const studentClass = req.user.class;
      const availableExams = await Exam.countDocuments({ status: 'published', targetClasses: { $in: [studentClass] } });
      const completedResults = await Result.find({ student: req.user._id });

      const completedCount = completedResults.length;
      const avgPercentage = completedCount > 0
        ? Math.round(completedResults.reduce((acc, r) => acc + r.percentage, 0) / completedCount)
        : 0;

      const announcements = await Announcement.find({ targetAudience: { $in: ['All', 'Students'] } })
        .sort({ createdAt: -1 })
        .limit(4);

      return res.status(200).json({
        success: true,
        stats: {
          availableExams,
          completedExams: completedCount,
          avgPercentage
        },
        announcements
      });
    }
  } catch (error) {
    next(error);
  }
};
