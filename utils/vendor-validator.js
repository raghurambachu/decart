let { body, param, validationResult } = require("express-validator");

function vendorRegisterValidationRules() {
  return [
    body("email", "Email length should be 10 to 30 char").isEmail(),
    body(
      "username",
      "Username should be 8 or more characters without spaces."
    ).isLength({ min: 8, max: 20 }),
    body("password", "Password length should be 8 to 15 chars.").isLength({
      min: 8,
      max: 15,
    }),
  ];
}

const validateVendorRegisterForm = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  } else {
    const extractErrors = [];
    errors.array().map((err) => extractErrors.push(err.msg));
    req.flash("errors", extractErrors);
    res.redirect("/users/register");
  }
};

function verifyVendorIdRules() {
  return [
    param(
      "vendorId",
      "Is not a valid link. Please click on the link sent to your registered mail"
    ).isMongoId(),
  ];
}

function validateVerifyVendorIdRules(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  } else {
    const extractErrors = [];
    errors.array().map((err) => extractErrors.push(err.msg));
    req.flash("errors", extractErrors);
    res.redirect("/vendors/login");
  }
}

function verifyVendorFormRules() {
  return [
    param(
      "vendorId",
      "Is not a valid link. Click on valid link sent to your email"
    ).isMongoId(),
    body("mobile", "Mobile should be a valid 10 digit Number").isMobilePhone(
      "en-IN"
    ),
    body("code", "Code should be of 6 digits.").isLength({ min: 6, max: 6 }),
  ];
}

function validateVerifyVendorFormRules(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  } else {
    const extractErrors = [];
    errors.array().map((err) => extractErrors.push(err.msg));
    req.flash("errors", extractErrors);
    res.redirect(`/vendors/verify/${req.params.vendorId}`);
  }
}

module.exports = {
  vendorRegisterValidationRules,
  validateVendorRegisterForm,
  verifyVendorIdRules,
  validateVerifyVendorIdRules,
  verifyVendorFormRules,
  validateVerifyVendorFormRules,
};
