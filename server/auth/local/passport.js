import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, email, password, done) {
  console.log('localAuthenticate--->');

  User.findOne({
    email: email.toLowerCase()
  }).exec()
    .then(user => {
      //console.log('localAuthenticate user--->',user);

      if (!user) {
        return done(null, false, {
          message: 'This email is not registered.'
        });
      }

      user.authenticate(password, function(authError, authenticated) {
        
      console.log('localAuthenticate authenticated--->',authenticated);
      console.log('localAuthenticate password--->',password);
      console.log('localAuthenticate authError--->',authError);
        
        if (authError) {
          return done(authError);
        }

        if (!authenticated) {
          return done(null, false, { message: 'This password is not correct.' });
        } else {
          if(user.status=='active' || user.role == 'admin'){
            return done(null, user);
          }
          return done(null, false, { message: 'Your account inactive, please contact admin.' });
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User, config) {
  console.log('setup--->',User);

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  }, function(email, password, done) {
    return localAuthenticate(User, email, password, done);
  }));
}
