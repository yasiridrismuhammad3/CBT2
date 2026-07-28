const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

// @desc    Get all exams (Teacher / Admin view)
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res, next) => {
  try {
    const { status, subject, class: className } = req.query;
    let query = {};

    if (status) query.status = status;
    if (subject) query.subject = subject;
    if (className) query.targetClasses = className;

    const exams = await Exam.find(query)
      .populate('subject', 'name code')
      .populate('questions')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: exams.length, exams });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Available Exams for Logged-in Student
// @route   GET /api/exams/available
// @access  Private (Student)
exports.getAvailableExamsForStudent = async (req, res, next) => {
  try {
    const studentClass = req.user.class;

    // Find published exams targeting student's class
    const exams = await Exam.find({
      status: 'published',
      targetClasses: { $in: [studentClass] }
    }).populate('subject', 'name code').sort({ startDate: -1 });

    // Fetch existing submissions for this student
    const existingResults = await Result.find({ student: req.user._id });
    const submittedExamIds = existingResults.map((r) => r.exam.toString());

    const available = exams.map((exam) => {
      const isTaken = submittedExamIds.includes(exam._id.toString());
      const result = existingResults.find((r) => r.exam.toString() === exam._id.toString());
      return {
        ...exam.toObject(),
        isTaken,
        resultId: result ? result._id : null,
        score: result ? result.score : null,
        percentage: result ? result.percentage : null,
        statusLabel: isTaken ? 'Completed' : 'Available'
      };
    });

    res.status(200).json({ success: true, count: available.length, exams: available });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Exam details for taking (Student mode - hides correct answers)
// @route   GET /api/exams/:id/take
// @access  Private (Student)
exports.getExamForTaking = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subject', 'name code')
      .populate({
        path: 'questions',
        select: '-correctOption -explanation' // Hide correct option and explanation during live exam
      });

    if (!exam || exam.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Exam is not active or available' });
    }

    // Check if student already took it
    const existingResult = await Result.findOne({ student: req.user._id, exam: exam._id });
    if (existingResult) {
      return res.status(400).json({ success: false, message: 'You have already submitted this examination.' });
    }

    let questionsList = [...exam.questions];

    // Randomize questions if configured
    if (exam.randomizeQuestions) {
      questionsList = questionsList.sort(() => Math.random() - 0.5);
    }

    // Randomize options if configured
    if (exam.randomizeOptions) {
      questionsList = questionsList.map((q) => {
        const qObj = q.toObject();
        qObj.options = qObj.options.sort(() => Math.random() - 0.5);
        return qObj;
      });
    }

    res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        durationMinutes: exam.durationMinutes,
        questionsCount: questionsList.length,
        questions: questionsList
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Exam
// @route   POST /api/exams
// @access  Private (Teacher / Admin)
exports.createExam = async (req, res, next) => {
  try {
    const {
      title,
      subject,
      targetClasses,
      durationMinutes,
      passPercentage,
      questions,
      randomizeQuestions,
      randomizeOptions,
      showResultImmediately,
      startDate,
      endDate,
      status,
      term,
      academicSession
    } = req.body;

    const exam = await Exam.create({
      title,
      subject,
      targetClasses,
      durationMinutes: Number(durationMinutes) || 30,
      passPercentage: Number(passPercentage) || 50,
      questions: questions || [],
      randomizeQuestions: randomizeQuestions !== undefined ? randomizeQuestions : true,
      randomizeOptions: randomizeOptions !== undefined ? randomizeOptions : true,
      showResultImmediately: showResultImmediately !== undefined ? showResultImmediately : true,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: status || 'draft',
      term: term || 'First Term',
      academicSession: academicSession || '2025/2026',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Exam created successfully', exam });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Exam
// @route   PUT /api/exams/:id
// @access  Private (Teacher / Admin)
exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, message: 'Exam updated successfully', exam });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish / Unpublish Exam
// @route   PATCH /api/exams/:id/toggle-publish
// @access  Private (Teacher / Admin)
exports.togglePublishExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    exam.status = exam.status === 'published' ? 'draft' : 'published';
    await exam.save();

    res.status(200).json({
      success: true,
      message: `Exam status changed to ${exam.status.toUpperCase()}`,
      status: exam.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Exam
// @route   DELETE /api/exams/:id
// @access  Private (Teacher / Admin)
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    next(error);
  }
};
