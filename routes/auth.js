const router = require('express').Router();

const { loginValidator } = require('../validators');

const {
  handleAdminLogin, handleStudentLogin, generateNewAccessToken, logout,
  forgotPassword, resetPassword
} = require('../controllers/auth');

router.post('/admin/login', loginValidator, handleAdminLogin);
router.post('/student/login', loginValidator, handleStudentLogin);
router.get('/refresh_token', generateNewAccessToken);
router.get('/logout', logout)
router.post('/forgot_password', forgotPassword)
router.post('/reset_password', resetPassword)

//create admin - one time use
// router.get('/admin/register', async (req, res) => {
//   const passowrd = "";
//   const salt = await bcrypt.genSalt(10);
//   const hashedPass = await bcrypt.hash(passowrd, salt);
//   const admin = new Admin({ name: "Abhi", email: "test@123.com", password: hashedPass });
//   await admin.save();
//   res.status(200).json({ msg: "registered!" })
// })



module.exports = router;
