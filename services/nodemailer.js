const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_EMAIL_PASS,
  },
});

function sendCodeOnUserRegister(user) {
  return {
    from: process.env.APP_EMAIL,
    to: user.email,
    subject: "Welcome to Decart. Email Verification - Decart",
    html: `
            <h2>Welcome ${user.displayName}</h2>

            <p>
                You have successfully been registerd for Decart. Verify by putting the 6 digit code in the link provided below. Please also update your mobile number to get verified.

            </p>
            <h3>Verfication code : ${user.code}</h3>
            <br>
            <a href="http://localhost:3000/users/${user._id}/verify">
                Link to Verify your email
            </a>

            <h5>Note : Without verifying your email you cannot login to Decart.</h5>
        `,
  };
}

module.exports = {
  transporter,
  sendCodeOnUserRegister,
};
