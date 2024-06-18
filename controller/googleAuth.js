import GoogleStrategy from 'passport-google-oauth2';
import {} from "dotenv/config"
import passport from 'passport';


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(`Profile Data : ${JSON.stringify(profile)}`)
    done(null,profile)
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
  }
));

passport.serializeUser((user,done)=>{
    done(null,user)
}
)
passport.deserializeUser((user,done)=>{
    done(null,user)
}
)
