const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
