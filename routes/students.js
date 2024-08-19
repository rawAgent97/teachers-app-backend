const express = require("express");
const router = express.Router();
const Student = require("../models/Students");
const authMiddleware = require("../middleware/auth");
const StudentDetails = require("../models/StudentDetails");

// Add or update student details
router.post("/add", authMiddleware, async (req, res) => {
  const { name, subject, marks } = req.body;
  const userId = req.user.userId; // User ID from JWT payload
    try {
    // Find an existing record with the same name and subject
    const existingRecord = await Student.findOne({ userId, name });
   
    if (existingRecord) {
      // Update the existing record with new marks
      const studentRecord=await StudentDetails.findOne({userId,name,studentId:existingRecord._id,subject})
      if (studentRecord){
        studentRecord.marks = marks;
        await studentRecord.save();
        res.status(200).send("Student details updated");
      }
      else{
        const  newStudentDetailsRecord= new StudentDetails({userId,name,studentId:existingRecord._id,marks,subject})
      await newStudentDetailsRecord.save();
      res.status(201).send("Student details added");
      }
     
    } else {
      // Create a new record if no existing record is found
      const newStudentRecord = new Student({
        userId,
        name,
      });
      const  newStudentDetailsRecord= new StudentDetails({userId,name,studentId:newStudentRecord._id, marks,subject})

     

      await newStudentRecord.save();
      await newStudentDetailsRecord.save();
      res.status(201).send("Student details added");
    }
  } catch (err) {
    res.status(500).send("Error processing student details");
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  const userId = req.user.userId; // User ID from JWT payload
  const {sort}=req.query;
  try {
    // Find all student records for the given userId
    const studentRecords = await StudentDetails.find({ userId });

    if (studentRecords.length === 0) {
      return res.status(404).send("No records found for this user");
    }

    if (studentRecords.length>0 && sort){
      if (sort=="asc"){
        const sortedRecords = await StudentDetails.find({ userId }).sort({ ["marks"]: 1 });
        res.json(sortedRecords)
      }
      else{
        const sortedRecords = await StudentDetails.find({ userId }).sort({ ["marks"]: -1 });
        res.json(sortedRecords)
      }
      
    }
    else{
      res.json(studentRecords);
    }

    
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
    const studentRecord= await StudentDetails.findById(id)
    const existingRecords= await StudentDetails.find({userId,name,subject})
    if (existingRecords.length>1 || ( existingRecords.length == 1 && studentRecord._id.toHexString() !== existingRecords[0]._id.toHexString() )){
      return res.status(400).send("Record with same details already exists.");
    }
    else if (existingRecords.length == 1 && studentRecord._id.toHexString() === existingRecords[0]._id.toHexString()){
      studentRecord.subject = subject;
          studentRecord.marks = marks;
       await studentRecord.save();
       res.status(200).send("Student details updated");
    }
    else{
      const studentRecordWithSameName=await StudentDetails.findOne({userId, name})
      if (studentRecordWithSameName){
        studentRecord.studentId=studentRecordWithSameName.studentId
        studentRecord.name=name
        studentRecord.subject = subject;
        studentRecord.marks = marks;
     await studentRecord.save();
     res.status(200).send("Student details updated");
      }else{
    const newStudentRecord = new Student({
      userId,
      name,
    });
    studentRecord.studentId=newStudentRecord._id
        studentRecord.name=name
        studentRecord.subject = subject;
        studentRecord.marks = marks;
    await newStudentRecord.save();
    await studentRecord.save()
    res.status(200).send("Student details updated");

      }
     
    }
  } catch (err) {
    res.status(500).send("Error updating student details");
  }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params; // Extract ID from URL parameters
  const userId = req.user.userId; // User ID from JWT payload

  try {
    // Find and delete the student by ID and userId
    const student = await StudentDetails.findByIdAndDelete({ _id: id, userId });

    if (!student) {
      return res.status(404).send("Student not found");
    }

    res.status(200).send("Student record deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting student record");
  }
});

module.exports = router;
