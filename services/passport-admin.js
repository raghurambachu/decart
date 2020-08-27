const passport = require("passport");
const Admin = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;
const { verifyPassword } = require("../middlewares/auth");

let options = {
  usernameField: "email",
  passwordField: "password",
};

// Basically Authenticated during login
function verifyAdmin(email, password, done) {
  Admin.findOne({ email }, function (err, admin) {
    console.log(admin);
    if (!admin) {
      return done(null, false, {
        message: "Admin with this email does'nt exist",
      });
    }

    // Check if password matches
    verifyPassword(password, admin.hash, function (err, isValid) {
      if (isValid) {
        return done(null, admin);
      } else {
        return done(null, false, { message: "Invalid Credentials" });
      }
    });
  });
}

passport.use(new LocalStrategy(options, verifyAdmin));

passport.serializeUser(function (admin, done) {
  done(null, admin.id);
});

passport.deserializeUser(function (id, done) {
  Admin.findById(id, function (err, user) {
    done(err, admin);
  });
});
