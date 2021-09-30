const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require("../models/user");

//Require your User Model here!

// configuring Passport!
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  function(accessToken, refreshToken, profile, cb) {
    // <- verify callback function, this function is called
    // whenever the user has been logged in using the oAuth
    console.log(profile, "<----- Profile"); // <--- Is going to be the users that just logged information from google


    User.findOne({ googleId: profile.id }, function (err, userDoc) {
      if (err) return cb(err); 

      if (userDoc) {

        return cb(null, userDoc); 
      } else {
        // Create the user in the db
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        newUser.save(function (err) {
          if (err) return cb(err);
          return cb(null, newUser);
        });

      }
    });

  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {

  User.findById(id, function (err, userDoc) { // search our databases for the user, with the id from the session
    done(err, userDoc); // when we call done here pass in the studentDoc,  This is where req.user = studentDoc
  });

});



