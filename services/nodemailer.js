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
            <a href="https://decarts.herokuapp.com/users/verify/${user._id}">
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

function sendCodeOnVendorRegister(vendor) {
  return {
    from: process.env.APP_EMAIL,
    to: vendor.email,
    subject: "Welcome to Decart. Vendor Email Verification - Decart",
    html: `
            <h2>Welcome ${vendor.displayName}</h2>

            <p>
                You have successfully been registerd for Decart. Verify by putting the 6 digit code in the link provided below. Please also update your mobile number to get verified.

            </p>
            <h3>Verfication code : ${vendor.code}</h3>
            <br>
            <a href="https://decarts.herokuapp.com/vendors/verify/${vendor._id}">
                Link to Verify your email
            </a>

            <h5>Note : Without verifying your email you cannot login to Decart Vendor Portal.</h5>
        `,
  };
}

function sendAdminVerificationPending(vendor) {
  return {
    from: process.env.APP_EMAIL,
    to: vendor.email,
    subject: "Vendor code verification successfull, Admin Verificatin Pending",
    html: `
            <h2>Hello ${vendor.displayName}</h2>

            <p>
                You have successfully verified using the 6 digit code. Within 2 or 3 Business days you will be approved by the admin based on your credentials. Once Admin verified you can log in to your Vendor Portal Dashboard and publish your products on Decart.

            </p>
           

            <h5>Note : Admin approval is subject to your credentials.</h5>
        `,
  };
}

function sendSuccessfulVendorRegistration(vendor) {
  return {
    from: process.env.APP_EMAIL,
    to: vendor.email,
    subject: "Successully Registered For Decart Vendor Portal",
    html: `
            <h2>Welcome ${vendor.displayName}</h2>

            <p>
                You have successfully been registerd for Decart Vendor Portal. You can create products, publish products and be the part of our growth story.


            </p>

            <h4>CEO : Raghuram Bachu</h4>
        `,
  };
}

function sendEmailOnUserBlockUnblock(agent, status) {
  const blockedContent =
    "<p>It has been observed you have some irresponsible behaviour towards the Decart and your network activity seems to be suspiscious, in lieu of that we are blocking your account. For any queries contact customer care Decart. </p>";
  const unblockContent =
    "<p> Based on your behaviour and request to customer care , we have unblocked you. Continue enjoying the services offered by Decart. </p>";
  return {
    from: process.env.APP_EMAIL,
    to: agent.email,
    subject: `${
      status === "blocked"
        ? "Email blocked from further usage."
        : "Email unblocked"
    } `,
    html: `
            <h2>Hello ${agent.displayName},</h2>
            ${status === "blocked" ? blockedContent : unblockContent}
            
            <h4>CEO : Raghuram Bachu</h4>
        `,
  };
}

module.exports = {
  transporter,
  sendCodeOnUserRegister,
  sendSuccessfulRegistrationMessage,
  sendCodeOnVendorRegister,
  sendSuccessfulVendorRegistration,
  sendAdminVerificationPending,
  sendEmailOnUserBlockUnblock,
};
