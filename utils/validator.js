let { body, validationResult } = require("express-validator");

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

module.exports = {
  userRegisterValidationRules,
  validateRegisterForm,
};
