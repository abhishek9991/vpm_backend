const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const RefreshToken = require('../models/RefreshToken')
const { sendMail } = require('./email');
const jwt = require('jsonwebtoken');

exports.handleAdminLogin = async (req, res) => {
  //checking if email exists
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) {
    return res.status(400).json({ error: "Email is Incorrect!" });
  }


  //checking if passowrd is correct
  const validPass = await bcrypt.compare(req.body.password, admin.password);
  if (!validPass) {
    return res.status(400).json({ error: "Password is Incorrect!" });
  }

  //make tokens
  const accessToken = generateAccessToken({ email: admin.email, name: admin.name, role: "admin" });
  const refreshToken = jwt.sign({ email: admin.email, name: admin.name, role: "admin" }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });


  try {
    //insert access token into DB
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await RefreshToken.findOneAndUpdate({ email: req.body.email }, { email: req.body.email, token: refreshToken }, options);
    res.cookie('refresh_token', refreshToken,
      { maxAge: 6 * 24 * 60 * 60 * 1000, httpOnly: true, secure: process.env.NODE_ENV === 'production' ? true : false });
    return res.status(200).json({ accessToken, user: { name: admin.name, email: admin.email, role: 'admin' } });
  } catch (error) {
    return res.status(400).json({ error });
  }

}

//handle student login
exports.handleStudentLogin = async (req, res) => {
  //checking if email exists
  const student = await Student.findOne({ email: req.body.email });
  if (!student) {
    return res.status(400).json({ error: "Email is Incorrect!" });
  }


  //checking if passowrd is correct
  const validPass = await bcrypt.compare(req.body.password, student.password);
  if (!validPass) {
    return res.status(400).json({ error: "Password is Incorrect!" });
  }

  //make tokens
  const accessToken = generateAccessToken({ email: student.email, vpmId: student.vpmId, role: "student" });
  const refreshToken = jwt.sign({ email: student.email, vpmId: student.vpmId, role: "student" }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });


  try {
    //insert access token into DB
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await RefreshToken.findOneAndUpdate({ email: req.body.email }, { email: req.body.email, token: refreshToken }, options);
    res.cookie('refresh_token', refreshToken,
      { maxAge: 6 * 24 * 60 * 60 * 1000, httpOnly: true, secure: process.env.NODE_ENV === 'production' ? true : false });
    return res.status(200).json({ accessToken, user: { name: student.name, email: student.email, role: 'student' } });
  } catch (error) {
    return res.status(400).json({ error });
  }
}



//helper function for generating access token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
}


//to make new access tokens
exports.generateNewAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken)
    return res.status(401).json({ error: "Access Denied!" });
  try {
    const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const rToken = await RefreshToken.findOne({ email: user.email, token: refreshToken });
    if (!rToken) {
      return res.status(401).json({ error: "Access Denied!" });
    } else {
      delete user.iat;
      delete user.exp;
      const newAccessToken = generateAccessToken(user);
      return res.json({ accessToken: newAccessToken, user });
    }
  } catch (error) {
    res.status(401).json({ error: "Access Denied!" })
  }
}


//clear cookie, delete refresh token from db => logout
exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: "Login Required" });
  }

  try {
    const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await RefreshToken.findOneAndDelete({ email: user.email });
    res.clearCookie('refresh_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' ? true : false })
    return res.json({ msg: "Logout Successful!" });
  } catch (error) {
    return res.status(401).json({ error: "Access Denied!" });
  }




}


//has access Token middleware
exports.authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const accessToken = authHeader && authHeader.split(' ')[1]
  if (accessToken == null) return res.status(401).json({ error: "Login Required" });

  jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (error, user) => {
    if (error) return res.status(403).json({ error })
    req.user = user;
    next()
  })
}

//is admin middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.role === 'admin')
    return next()
  else {
    return res.status(401).json({ error: "Access Denied!" });
  }
}

//is student middleware
exports.isStudent = (req, res, next) => {
  if (req.user.role === 'student')
    return next()
  else {
    return res.status(401).json({ error: "Access Denied!" });
  }
}


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ error: "email required" });
  try {
    const student = await Student.findOne({ email });
    if (!student)
      return res.status(204).json({ error: "Student not found!" });

    const secret = student.vpmId + process.env.PASSWORD_RESET_SECRET + student.password;
    const token = jwt.sign({ email: student.email, vpmId: student.vpmId }, secret, { expiresIn: '20m' });
    const passwordResetLink = `http://localhost:5000/reset_password/${student.vpmId}/${token}`;
    const emailResult = await sendMail({ emailData: { emailFor: 'resetPassword', userEmail: student.email, passwordResetLink } });
    console.log('auth controller,', emailResult);
    if (emailResult.Error)
      return res.status(500).json({ error: "could not send password reset link to your email address." });
    res.json({ msg: "Password reset link has been sent to your email.", emailMsg: emailResult })
  } catch (error) {
    return res.status(500).json({ error: "could not send password reset link to your email address." });
  }
}

exports.resetPassword = async (req, res) => {
  const { vpmId, token, password } = req.body;
  if (!password)
    return res.status(400).json({ error: "New password required" });

  try {
    const student = await Student.findOne({ vpmId });
    if (!student)
      return res.status(401).json({ error: "invalid access" });

    const secret = student.vpmId + process.env.PASSWORD_RESET_SECRET + student.password;

    jwt.verify(token, secret, async function (error, payload) {
      if (error) return res.status(403).json({ error })
      if (payload.email !== student.email || payload.vpmId !== student.vpmId)
        return res.status(401).json({ error: "invalid access" });
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
      console.log(hashedPass, student.password);
      student.password = hashedPass;
      await student.save();
      return res.json({ msg: "Your password reset has been successful!" });
    })
  } catch (error) {
    return res.status(500).json({ error: "Failed to reset your password." });
  }
}