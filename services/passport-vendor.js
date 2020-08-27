const passport = require("passport");
const Vendor = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;
const { verifyPassword } = require("../middlewares/auth");

let options = {
  usernameField: "email",
  passwordField: "password",
};

// Basically Authenticated during login
function verifyVendor(email, password, done) {
  Vendor.findOne({ email }, function (err, vendor) {
    //   Registered either by local, google Auth or None
    if (!vendor) {
      return done(null, false, {
        message:
          "Vendor not registered. Please register to list the products and be the part of Decart.",
      });
    }

    // Check if password matches
    verifyPassword(password, vendor.hash, function (err, isValid) {
      if (isValid) {
        // Before serializing it we also need to ensure that vendor is also verified,isAdminVerified and is not Blocked
        if (vendor.isBlocked) {
          return done(null, false, {
            message: `${email} is blocked. Cannot login to Decart!!`,
          });
        }

        if (!vendor.isVerified) {
          return done(null, false, {
            message:
              "Verify yourself by clicking on the link sent to you on your email.Once you are verified, you will also be admin verified",
          });
        } else {
          if (!vendor.isAdminVerified) {
            return done(null, false, {
              message:
                "Need to be admin verified, will be notified within 2 business days.",
            });
          } else {
            return done(null, vendor);
          }
        }
      } else {
        console.log("Invalid Credentials");
        return done(null, false, { message: "Invalid Credentials" });
      }
    });
  });
}

passport.use(new LocalStrategy(options, verifyVendor));

passport.serializeUser(function (vendor, done) {
  done(null, vendor.id);
});

passport.deserializeUser(function (id, done) {
  Vendor.findById(id, function (err, user) {
    done(err, vendor);
  });
});

// User.findOne({ email }, function (err, user) {
//   //   Registered either by local, google Auth or None
//   if (!user) {
//     return done(null, false, {
//       message: "User not registered. Please register to continue shopping.",
//     });
//   }
//   // get the provider;
//   let provider = user.provider;
//   if (provider.includes("local")) {
//     // Check if password matches
//     verifyPassword(password, user.hash, function (err, isValid) {
//       if (isValid) {
//         // Before serializing it we also need to ensure that user is also verified and is not Blocked
//         if (user.isBlocked) {
//           return done(null, false, {
//             message: `${email} is blocked. Cannot login to Decart!!`,
//           });
//         }

//         if (!user.isVerified) {
//           console.log("Verified Email");
//           return done(null, false, {
//             message:
//               "Verify yourself by clicking on the link sent to you on your email.Once you are verified, you can login",
//           });
//         } else {
//           return done(null, user);
//         }
//       } else {
//         console.log("Invalid Credentials");
//         return done(null, false, { message: "Invalid Credentials" });
//       }
//     });
//   } else {
//     return done(
//       null,
//       false,
//       "You are registered using Google Auth, try logging in with Google Auth"
//     );
//   }
// });
