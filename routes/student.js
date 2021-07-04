const router = require('express').Router();

const {
  authenticateAccessToken, isStudent, isAdmin
} = require('../controllers/auth');
const {
  addStudent, updateStudentByAdmin, getStudent, getStudentProfile, updateStudentWorkDetails, searchStudents
} = require('../controllers/student');


//routes for admin
router.post('/new', authenticateAccessToken, isAdmin, addStudent);
router.get('/get', authenticateAccessToken, isAdmin, getStudent);
router.post('/search', authenticateAccessToken, isAdmin, searchStudents);
router.post('/details/update', authenticateAccessToken, isAdmin, updateStudentByAdmin);

//routes for student
router.get('/get/profile', authenticateAccessToken, isStudent, getStudentProfile);
router.post('/profile/update', authenticateAccessToken, isStudent, updateStudentWorkDetails);


module.exports = router;