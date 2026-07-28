const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required (e.g. SS 3A)'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Junior Secondary', 'Senior Secondary'],
      required: true
    },
    arm: {
      type: String,
      default: 'A'
    },
    capacity: {
      type: Number,
      default: 50
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Class', classSchema);
