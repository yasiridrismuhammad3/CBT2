const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalMarks: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E', 'F'],
      required: true
    },
    status: {
      type: String,
      enum: ['Passed', 'Failed'],
      required: true
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question'
        },
        selectedOption: { type: String, default: '' },
        isCorrect: { type: Boolean, default: false },
        marksObtained: { type: Number, default: 0 }
      }
    ],
    timeTakenSeconds: {
      type: Number,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    positionInClass: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple exam attempts by the same student for the same exam if submission is finished
resultSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
