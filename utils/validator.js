let { body, param, validationResult } = require("express-validator");

function userRegisterValidationRules() {
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

const validateRegisterForm = (req, res, next) => {
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

// Check whether Id is a valid MongoId in route for verify user code.
function verifyUserIdRules() {
  return [
    param(
      "userId",
      "Is not a valid link. Please click on the link sent to your registered mail"
    ).isMongoId(),
  ];
}

function validateVerifyUserIdRules(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  } else {
    const extractErrors = [];
    errors.array().map((err) => extractErrors.push(err.msg));
    req.flash("errors", extractErrors);
    res.redirect("/users/login");
  }
}

function verifyUserFormRules() {
  return [
    param(
      "userId",
      "Is not a valid link. Click on valid link sent to your email"
    ).isMongoId(),
    body("mobile", "Mobile should be a valid 10 digit Number").isMobilePhone("en-IN"),
    body("code", "Code should be of 6 digits.").isLength({ min: 6, max: 6 }),
  ];
}

function validateVerifyUserFormRules(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  } else {

    const extractErrors = [];
    errors.array().map((err) => extractErrors.push(err.msg));
    req.flash("errors", extractErrors);
    res.redirect(`/users/verify/${req.params.userId}`);
  }
}

module.exports = {
  userRegisterValidationRules,
  validateRegisterForm,
  verifyUserIdRules,
  validateVerifyUserIdRules,
  verifyUserFormRules,
  validateVerifyUserFormRules,
};
