const express = require('express');
const router = express.Router();

//User model
const User = require('../models/User');

//Login page
router.get('/login', (req, res) => res.render('login'));

//Register page
router.get('/register', (req, res) => res.render('register'));

//Register handler
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    let errors = [];

    //Check fields for correct input
    if (!username || !password) {
        errors.push({ msg: 'Please fill in the required fields' });
    }

    //Check for password length
    if (password.length < 6) {
        errors.push({ msg: 'Password has to be at least 6 characters' });
    }

    //To register or not
    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            password,
        });
    } else {
        //Registration successful
        User.findOne({ username: username})
        .then(user => {
            if(user) {
                //If username already exists
                errors.push({ msg: 'Username already exists!' });
                res.render('register', {
                    errors,
                    username,
                    password,
                });
            } else {
                const new_user = new User ({
                    username,
                    password
                });
               new_user.save()
               .then(user => {
                   res.redirect('../users/login');
               })
               .catch(err => console.log(err));
            }
        });
    }
});

module.exports = router;