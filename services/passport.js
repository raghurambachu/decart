const passport = require("passport");
const User = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const { verifyPassword } = require("../middlewares/auth");

let options = {
  usernameField: "email",
  passwordField: "password",
};

// Basically Authenticated during login
function verifyUser(email, password, done) {
  User.findOne({ email }, function (err, user) {
    //   Registered either by local, google Auth or None
    if (!user) {
      return done(null, false, {
        message: "User not registered. Please register to continue shopping.",
      });
    }
    // get the provider;
    let provider = user.provider;
    if (provider.includes("local")) {
      // Check if password matches
      verifyPassword(password, user.hash, function (err, isValid) {
        if (isValid) {
          // Before serializing it we also need to ensure that user is also verified and is not Blocked
          if (user.isBlocked) {
            return done(null, false, {
              message: `${email} is blocked. Cannot login to Decart!!`,
            });
          }

          if (!user.isVerified) {
            console.log("Verified Email");
            return done(null, false, {
              message:
                "Verify yourself by clicking on the link sent to you on your email.Once you are verified, you can login",
            });
          } else {
            return done(null, user);
          }
        } else {
          console.log("Invalid Credentials");
          return done(null, false, { message: "Invalid Credentials" });
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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENTID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENTSECRET,
      callbackURL: "/users/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // let email = profile.emails[0].value,
      User.findOne({ email: profile.emails[0].value }, (err, user) => {
        if (err)
          return done(null, false, {
            message: "There was some error. Try again later.",
          });
        if (user) {
          // get the user role
          if (user.provider.includes("google")) {
            return done(null, user);
          } else {
            return done(null, false, {
              message:
                "You have registered using Email & Password, use your credentials to log in.",
            });
          }
        } else {
          // Create a user
          //   Need to create a cart;
          console.log("entered");
          const email = profile.emails[0].value;
          const newUser = {
            email,
            username: profile.displayName.split(" ").join(""),
            displayName: profile.displayName,
            provider: ["google"],
            isVerified: true,
            role: "user",
            isBlocked: false,
            isPlus: false,
          };
          User.create(newUser, (err, user) => {
            console.log(err);
            if (err) return done(null, false);
            console.log(user);
            return done(null, user);
          });
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
