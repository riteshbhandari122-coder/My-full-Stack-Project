const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          isGoogleUser: true,
          isVerified: true,
        });
      }

      // 🌱 One-time +100 Green Points bonus — same rule as email login/register.
      // Covers brand-new Google sign-ups AND existing Google accounts that
      // predate this feature and haven't received it yet.
      if (!user.hasReceivedLoginBonus) {
        user.greenPoints = (user.greenPoints || 0) + 100;
        user.hasReceivedLoginBonus = true;
        await user.save({ validateBeforeSave: false });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});