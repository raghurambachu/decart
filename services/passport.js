const passport = require("passport");
const User = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;
const { verifyPassword } = require("../middlewares/auth");

let options = {
  usernameField: email,
  passwordField: password,
};

// Basically Authenticated during login
function verifyUser(email, password, done) {
  User.findOne({ email }, function (err, user) {
    //   Registered either by local, google Auth or None
    if (!user) {
      return done(
        null,
        false,
        "User not registered. Please register to continue shopping."
      );
    }
    // get the provider;
    let provider = user.provider;
    if (provider.includes("local")) {
      // Check if password matches
      verifyPassword(password, user.hash, function (err, isVerified) {
        if (isVerified) {
          // Before serializing it we also need to ensure that user is also verified and is not Blocked
          if (user.isBlocked) {
            return done(
              null,
              false,
              `${email} is blocked. Cannot login to Decart!!`
            );
          } else if (!user.isVerified) {
            return done(
              null,
              false,
              "Verify yourself by clicking on the link sent to you on your email.Once you are verified, you can login"
            );
          } else {
            return done(null, user);
          }
        } else {
          return done(null, false, "Invalid Credentials");
        }
      });
    } else {
      return done(
        null,
        false,
        "You are registered using Google Auth, try logging in with Google Auth"
      );
    }
  });
}

passport.use(new LocalStrategy(options, verifyUser));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
