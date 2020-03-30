//Authentication method = local
const local_strategy = require('passport-local').Strategy;

//Include database so we can check if username & password exist in the database
const mongoose_database = require('mongoose');

//Bring in user model
const User = require('../models/User');

//Function that checks wether or not username and password exist (http://www.passportjs.org/docs/)
module.exports = function(passport) {
    passport.use(
        new local_strategy({ usernameField: 'username' }, (username, password, done) => {
            User.findOne({ username: username })
            .then(user => {
                if(!user) {
                    return done(null, false, {  message: 'Username not found.'});
                }
                if(password == user.password) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password doesnt match user.'});
                }
            })
            .catch()
        })
    );
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}