const bcrypt = require("bcrypt");
const passport = require("passport");

async function generateSaltAndHash(password) {
  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  } catch (err) {
    console.error(err);
  }
}

function verifyPassword(password, hash, isVerified) {
  bcrypt.compare(password, hash, function (err, bool) {
    isVerified(err, bool);
  });
}

function verifyIfUser(req, res, next) {
  if (req.user && req.user.role === "user") {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/users/login");
  }
}

function verifyIfVendor(req, res, next) {
  if (req.user && req.user.role === "vendor") {
    next();
  } else {
    console.log(req.originalUrl)
    req.session.returnTo = req.originalUrl;
    return res.redirect("/vendors/login");
  }
}

function verifyIfAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/admins/login");
  }
}

module.exports = {
  verifyPassword,
  generateSaltAndHash,
  verifyIfUser,
  verifyIfVendor,
  verifyIfAdmin,
};
