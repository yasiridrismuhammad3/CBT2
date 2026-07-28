const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');

// Grade calculator utility
const calculateGrade = (percentage) => {
  if (percentage >= 75) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
};

// @desc    Submit CBT Exam & Auto Grade
// @route   POST /api/results/submit
// @access  Private (Student)
exports.submitExam = async (req, res, next) => {
  try {
    const { examId, answers, timeTakenSeconds } = req.body;
    // answers format: { questionId: selectedOptionKey } e.g. { "60f1...": "A" }

    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check duplicate submission
    const existingResult = await Result.findOne({ student: req.user._id, exam: examId });
    if (existingResult) {
      return res.status(400).json({ success: false, message: 'Exam has already been submitted.' });
    }

    let totalScore = 0;
    let totalPossibleMarks = 0;
    const evaluatedAnswers = [];

    for (let q of exam.questions) {
      const qId = q._id.toString();
      const selectedOption = answers[qId] || '';
      const isCorrect = selectedOption.toUpperCase() === q.correctOption.toUpperCase();
      const mark = q.marks || 1;

      totalPossibleMarks += mark;
      if (isCorrect) {
        totalScore += mark;
      }

      evaluatedAnswers.push({
        question: q._id,
        selectedOption,
        isCorrect,
        marksObtained: isCorrect ? mark : 0
      });
    }

    const percentage = totalPossibleMarks > 0 ? Math.round((totalScore / totalPossibleMarks) * 100) : 0;
    const grade = calculateGrade(percentage);
    const status = percentage >= exam.passPercentage ? 'Passed' : 'Failed';

    const result = await Result.create({
      student: req.user._id,
      exam: examId,
      score: totalScore,
      totalMarks: totalPossibleMarks,
      percentage,
      grade,
      status,
      answers: evaluatedAnswers,
      timeTakenSeconds: timeTakenSeconds || 0,
      submittedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Examination submitted successfully!',
      resultId: result._id,
      score: totalScore,
      totalMarks: totalPossibleMarks,
      percentage,
      grade,
      status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Result Details (For student or teacher review)
// @route   GET /api/results/:id
// @access  Private
exports.getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'fullName dsNumber email class gender')
      .populate({
        path: 'exam',
        populate: { path: 'subject', select: 'name code' }
      })
      .populate('answers.question');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Security check: Students can only view their own result unless immediate viewing enabled
    if (req.user.role === 'student' && result.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this result' });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Results for an Exam (Teacher / Admin)
// @route   GET /api/results/exam/:examId
// @access  Private (Teacher / Admin)
exports.getResultsByExam = async (req, res, next) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate('student', 'fullName dsNumber email class gender')
      .sort({ score: -1, timeTakenSeconds: 1 });

    // Calculate class positions dynamically
    const rankedResults = results.map((resItem, index) => {
      const obj = resItem.toObject();
      obj.positionInClass = index + 1;
      return obj;
    });

    res.status(200).json({ success: true, count: rankedResults.length, results: rankedResults });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Results History
// @route   GET /api/results/student/history
// @access  Private (Student)
exports.getStudentResultHistory = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate({
        path: 'exam',
        populate: { path: 'subject', select: 'name code' }
      })
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};
