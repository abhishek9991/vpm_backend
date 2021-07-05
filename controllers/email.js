const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const createEmail = ({ emailData }) => {
  let email = {};
  switch (emailData.emailFor) {
    case 'newStudent':
      email.to = emailData.student.email;
      email.subject = 'Welcome to VPM family';
      email.textBody = `
      Welcome to VPM family
      Hello ${emailData.student.name},
      We are glad to inform you that you've been selected to become a part of VPM family.
      Followings are you login details for VPM panel.
      username:</b> ${emailData.student.email}
      
      Kindly note that in order to login in your account, you have to generate your login password by using forget password link given on VPM panel student login page.
    
      Rakesh Sethi
      VPM Chairman
      `
      email.htmlBody = `
      <div>
      <h1>Welcome to VPM family</h1>
      <p>Hello ${emailData.student.name},</p>
      <p>We are glad to inform you that you've been selected to become a part of VPM family.</p>
      <br/>
      <p>Followings are you login details for VPM panel.</p>
      <p><b>username:</b> ${emailData.student.email}</p>
      <br/>
      <p> Kindly note that in order to login in your account for the first time, you have to generate your login password by using forget password link given on VPM panel student login page</p>
      <br/>
      <p><i>Rakesh Sethi</i></p>
      <p>VPM Chairman</p>
      </div>
      `
      break;
    case 'newDisbursement':
      email.to = emailData.disbursement.email;
      email.subject = `Your remittance Details for ${emailData.disbursement.course}`;
      email.textBody = `
      Hello ${emailData.disbursement.name},
      You have been provided remittance for Educational fees, the details of which are as follows:
      Name: ${emailData.disbursement.name}
      vpmId ${emailData.disbursement.vpmId}
      Course: ${emailData.disbursement.course}
      Amount: Rs. ${emailData.disbursement.amount}/-
      Date: ${emailData.disbursement.date}
      
      Rakesh Sethi
      VPM Chairman
      `
      email.htmlBody = `
      <div>
      <p>Hello ${emailData.disbursement.name},</p>
      <p>You have been provided remittance for Educational fees, the details of which are as follows: </p>
      <p><b>Name:</b> ${emailData.disbursement.name}</p>
      <p><b>vpmId:</b> ${emailData.disbursement.vpmId}</p>
      <p><b>Course:</b> ${emailData.disbursement.course}</p>
      <p><b>Amount:</b> Rs. ${emailData.disbursement.amount}/-</p>
      <p><b>Date: </b> ${emailData.disbursement.date}</p>
      <br/> <br/>
      <p><i>Rakesh Sethi</i></p>
      <p>VPM Chairman</p>
      </div>
      `
      break;
    case 'resetPassword':
      email.to = emailData.userEmail;
      email.subject = 'Reset VPM Panel password';
      email.textBody = `
      Reset Password
      Password reset request has been made for your account.
      Click on the following link to reset your password. If the link given below is not clickable then copy the link and paster in broswer to reset the password
      
      Link : ${emailData.passwordResetLink}
      
      DO NOT SHARE THE PASSWORD RESET LINK WITH ANYONE
      The link will be active for 20 minutes only.
      `

      email.htmlBody = `
      <div>
      <h1>Reset Password</h1>
      <p> Password reset request has been made for your account. </p>
      <p>Click on the following link to reset your password. If the link given below is not clickable then copy the link and paster in broswer to reset the password</p>
      <br/>
      <p>Link : ${emailData.passwordResetLink}</p>
      <br/>
      <p><b> DO NOT SHARE THE PASSWORD RESET LINK WITH ANYONE</b><p>
      <p>The link will be active for 20 minutes only.</p>
      </div>
      `
      break;

    default:
      console.log(emailData);
  }
  return email;
}



exports.sendMail = async (emailData) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    console.log(emailData);
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.ADMIN_EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const email = createEmail(emailData);
    const mailOptions = {
      from: `Vishwa Prakash Mission ${process.env.ADMIN_EMAIL}`,
      to: email.to,
      subject: email.subject,
      text: email.textBody,
      html: email.htmlBody,
    };
    console.log(email);
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// sendMail()
//   .then((result) => console.log('Email sent...', result))
//   .catch((error) => console.log(error.message));
