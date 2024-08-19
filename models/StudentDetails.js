const mongoose = require('mongoose');

const StudentDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  marks: { type: Number, required: true }
});

module.exports = mongoose.model('StudentDetails', StudentDetailsSchema);