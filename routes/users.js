var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// register
router.get('/register', function(req, res) {
    res.render('register');
});

//login
router.get('/login', function(req, res) {
    res.render('login');
});

// register user
router.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var confpass = req.body.confpass;

    //validation
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('confpass', 'Passwords must match').equals(req.body.password);
    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
		res.render('register',{
            errors:errors
		});
    } else {
        var newUser = new User({
            username: username,
            password: password
        });


        User.createUser(newUser, function(err, user) {
            if(err) {
                if(err.errmsg.indexOf('duplicate key error') > -1) {
                    console.log(err)
                    req.flash('error_msg', 'The username '+ newUser.username + ' has already been registered');
                    return res.redirect('/users/login');
                } else {
                    console.log(err)
                    req.flash('error_msg', 'Opps! Something went wrong, please try again.');
                    return res.redirect('/users/login');
                } 
            }
            console.log(user);
            req.flash('success_msg', 'You are registered and can now login');
            res.redirect('/users/login');
        });
       
        // User.createUser(newUser, function(err, user) {
        //     if(err) throw err;
        //     console.log(user);
        // });

        // req.flash('success_msg', 'You are registered and can now login');
        // res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if(err) throw err;
            if(!user) {
                return done(null, false, {message: 'Unknown User'});
            }
            User.comparePassword(password, user.password, function(err, isMatch) {
                if(err) throw err;
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: ''})
                }
            })
        });
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function(req, res) {
    req.logout();
    
    req.flash('success_msg', 'You are logged out!');

    res.redirect('/users/login');
});
module.exports = router;