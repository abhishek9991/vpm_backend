const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
dotenv.config();

//connect to DB
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('connected to DB');
  })
mongoose.set('useFindAndModify', false);
app.use(express.json());
app.use(cors({ credentials: true }));
app.use(cookieParser());

//import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const disbursementRoutes = require('./routes/disbursement');

//route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/disbursement', disbursementRoutes);







app.listen(process.env.PORT || 5000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('server started')
  }
})