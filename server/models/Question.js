const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required']
    },
    class: {
      type: String,
      required: [true, 'Class level is required (e.g. SS 3)']
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    questionImage: {
      type: String,
      default: ''
    },
    options: [
      {
        key: { type: String, required: true }, // 'A', 'B', 'C', 'D'
        text: { type: String, required: true },
        image: { type: String, default: '' }
      }
    ],
    correctOption: {
      type: String,
      required: [true, 'Correct option key (A, B, C, or D) is required'],
      enum: ['A', 'B', 'C', 'D']
    },
    explanation: {
      type: String,
      default: ''
    },
    marks: {
      type: Number,
      default: 1
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);
