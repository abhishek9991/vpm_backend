const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const _ = require('lodash');

//for admin
exports.addStudent = async (req, res) => {
  // const { vpmId, name, fatherName, motherName, lostParent,
  //   address, state, district, pincode, email, course, stream,
  //   regular, college, sponsor } = req.body.student;
  const studentDetails = req.body.student;
  const passowrd = `${studentDetails.vpmId}@VPM`;
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(passowrd, salt);
  const student = new Student(studentDetails);
  student.password = hashedPass;

  try {
    await student.save();
    return res.status(200).json({ msg: "Successfully Added Student" })
  } catch (error) {
    return res.status(400).json({ error: "Failed to add Student! Make sure you entered data correctly and try again!!", msg: error });
  }
}

exports.searchStudents = async (req, res) => {
  const { parameter, value } = req.body;
  try {
    const result = await Student.find({ [parameter]: value }, '-password -_id');
    if (!result || result.length === 0) {
      return res.status(204).json({ error: "no student found" })
    } else {
      return res.json({ students: result });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
}

exports.getStudent = async (req, res) => {
  try {
    const result = await Student.findOne({ vpmId: req.query.vpmId }, '-password');
    if (!result) {
      return res.status(204).json({ error: "student not found" });
    } else {
      return res.json({ student: result });
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
}

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}, '-password');
    if (!students || students.length === 0)
      return res.status(204).json({ error: "no student found." });
    return res.json({ students })
  } catch (error) {
    res.status(400).json({ error, msg: "Failed to search students" });
  }
}

exports.updateStudentByAdmin = async (req, res) => {
  if (req.body.updatedDetails.password)
    return res.status(400).json({ error: "bad request" });
  try {
    let student = await Student.findOne({ vpmId: req.body.vpmId }, '-password');
    if (!student) {
      return res.status(204).json({ error: "student not found!" });
    }
    student = _.extend(student, req.body.updatedDetails);
    try {
      await student.save();
      return res.json({ msg: "successfully updated student", updatedStudent: student });
    } catch (error) {
      return res.status(400).json({ error });
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
}

//for student
exports.getStudentProfile = async (req, res) => {
  const { email } = req.user.email;
  try {
    const result = await Student.findOne({ email }, '-password');
    if (!result) {
      return res.status(204).json({ error: "student not found" });
    } else {
      return res.json({ student: result });
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
}

exports.updateStudentWorkDetails = async (req, res) => {
  try {
    let student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(204).json({ error: "student not found!" });
    }

    if (req.body.internship) {
      student.internship.push(req.body.internship)
    } else if (req.body.job) {
      student.job = req.body.job;
    }
    try {
      await student.save();
      return res.json({ msg: "successfully updated student", student });
    } catch (error) {
      return res.status(400).json({ error });
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
}