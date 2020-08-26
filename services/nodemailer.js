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
            <a href="http://localhost:3000/users/verify/${user._id}">
                Link to Verify your email
            </a>

            <h5>Note : Without verifying your email you cannot login to Decart.</h5>
        `,
  };
}

function sendSuccessfulRegistrationMessage(user) {
  return {
    from: process.env.APP_EMAIL,
    to: user.email,
    subject: "Welcome to Decart. Email Verification - Decart",
    html: `
            <h2>Welcome ${user.displayName}</h2>

            <p>
                You have successfully been registerd for Decart. You can shop across various categories and explore the unexplored. Apart from this you can also avail Plus services to get faster delivery of orders.
                Be rest assured quality of product is our responsibility.

            </p>

            <h4>CEO : Raghuram Bachu</h4>
        `,
  };
}

module.exports = {
  transporter,
  sendCodeOnUserRegister,
  sendSuccessfulRegistrationMessage,
};
