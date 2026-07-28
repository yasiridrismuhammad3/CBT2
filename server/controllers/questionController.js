const Question = require('../models/Question');

// @desc    Get questions with filters (subject, class, search)
// @route   GET /api/questions
// @access  Private (Teacher / Admin)
exports.getQuestions = async (req, res, next) => {
  try {
    const { subject, class: className, difficulty, search } = req.query;
    let query = {};

    if (subject) query.subject = subject;
    if (className) query.class = className;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.questionText = { $regex: search, $options: 'i' };

    const questions = await Question.find(query)
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: questions.length, questions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Question
// @route   POST /api/questions
// @access  Private (Teacher / Admin)
exports.createQuestion = async (req, res, next) => {
  try {
    const { subject, class: className, questionText, questionImage, options, correctOption, explanation, marks, difficulty } = req.body;

    if (!options || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Question must have at least 2 options' });
    }

    const question = await Question.create({
      subject,
      class: className,
      questionText,
      questionImage: questionImage || '',
      options,
      correctOption: correctOption ? correctOption.toUpperCase() : 'A',
      explanation: explanation || '',
      marks: marks || 1,
      difficulty: difficulty || 'Medium',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Question created successfully', question });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Question
// @route   PUT /api/questions/:id
// @access  Private (Teacher / Admin)
exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Question updated successfully', question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Question
// @route   DELETE /api/questions/:id
// @access  Private (Teacher / Admin)
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Import Questions
// @route   POST /api/questions/bulk-import
// @access  Private (Teacher / Admin)
exports.bulkImportQuestions = async (req, res, next) => {
  try {
    const { subjectId, classLevel, questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of questions' });
    }

    const formattedQuestions = questions.map((q) => ({
      subject: subjectId || q.subject,
      class: classLevel || q.class || 'SS 3A',
      questionText: q.questionText || q.question,
      options: [
        { key: 'A', text: q.optionA || (q.options && q.options[0]?.text) || 'Option A' },
        { key: 'B', text: q.optionB || (q.options && q.options[1]?.text) || 'Option B' },
        { key: 'C', text: q.optionC || (q.options && q.options[2]?.text) || 'Option C' },
        { key: 'D', text: q.optionD || (q.options && q.options[3]?.text) || 'Option D' }
      ],
      correctOption: (q.correctOption || q.correct || 'A').toUpperCase(),
      explanation: q.explanation || '',
      marks: Number(q.marks) || 1,
      difficulty: q.difficulty || 'Medium',
      createdBy: req.user._id
    }));

    const inserted = await Question.insertMany(formattedQuestions);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} questions into question bank!`,
      count: inserted.length
    });
  } catch (error) {
    next(error);
  }
};
