const router = require('express').Router();

const {
  createDisbursement, getAllDisbursements, getDisbursement, deleteDisbursement, getStudentDisbursements, editDisbursement
} = require('../controllers/disbursement');

const {
  authenticateAccessToken, isAdmin, isStudent
} = require('../controllers/auth');

//for admin
router.post('/new', authenticateAccessToken, isAdmin, createDisbursement);
router.get('/get/all', authenticateAccessToken, isAdmin, getAllDisbursements);
router.post('/get', authenticateAccessToken, isAdmin, getDisbursement);
router.post('/edit', authenticateAccessToken, isAdmin, editDisbursement);
router.post('/delete', authenticateAccessToken, isAdmin, deleteDisbursement);

//for student
router.get('/student/get', authenticateAccessToken, isStudent, getStudentDisbursements);


module.exports = router;