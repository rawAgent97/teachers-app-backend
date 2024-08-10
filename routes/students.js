const express = require("express");
const router = express.Router();
const Student = require("../models/Students");
const authMiddleware = require("../middleware/auth");

// Add or update student details
router.post("/add", authMiddleware, async (req, res) => {
  const { name, subject, marks } = req.body;
  const userId = req.user.userId; // User ID from JWT payload
    try {
    // Find an existing record with the same name and subject
    const existingRecord = await Student.findOne({ userId, name, subject });

    if (existingRecord) {
      // Update the existing record with new marks
      existingRecord.marks = marks;
      await existingRecord.save();
      res.status(200).send("Student details updated");
    } else {
      // Create a new record if no existing record is found
      const newStudentRecord = new Student({
        userId,
        name,
        subject,
        marks,
      });

      await newStudentRecord.save();
      res.status(201).send("Student details added");
    }
  } catch (err) {
    res.status(500).send("Error processing student details");
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  const userId = req.user.userId; // User ID from JWT payload
  try {
    // Find all student records for the given userId
    const studentRecords = await Student.find({ userId });

    if (studentRecords.length === 0) {
      return res.status(404).send("No records found for this user");
    }

    res.json(studentRecords);
  } catch (err) {
    res.status(500).send("Error retrieving student records");
  }
});

router.put("/update/:id", authMiddleware, async (req, res) => {
  const { id } = req.params; // Student ID from URL params
  const { name, subject, marks } = req.body;
  const userId = req.user.userId; // User ID from JWT payload

  if (!id || typeof marks !== "number") {
    return res.status(400).send("Invalid input");
  }

  try {
    const existingRecords = await Student.find({ userId, name, subject });
    const studentRecord = await Student.findById(id);
    if (
      existingRecords.length > 1 ||
      (existingRecords.length == 1 &&
        existingRecords[0]._id.toHexString() !==
          studentRecord._id.toHexString())
    ) {
      return res.status(400).send("Record with same details already exists.");
    } else {
      if (studentRecord) {
        // Update the record
        studentRecord.name = name;
        studentRecord.subject = subject;
        studentRecord.marks = marks;
        await studentRecord.save();

        res.status(200).send("Student details updated");
      }
    }
    // Find the record by ID and ensure it belongs to the user
  } catch (err) {
    res.status(500).send("Error updating student details");
  }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params; // Extract ID from URL parameters
  const userId = req.user.userId; // User ID from JWT payload

  try {
    // Find and delete the student by ID and userId
    const student = await Student.findByIdAndDelete({ _id: id, userId });

    if (!student) {
      return res.status(404).send("Student not found");
    }

    res.status(200).send("Student record deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting student record");
  }
});

module.exports = router;
