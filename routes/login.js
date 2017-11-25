/**********for /login route************/
const express = require('express');
const router = express.Router();
const User = require("../models/users.js");

//GET /login
//login page, renders a login form
router.get("/", function(req,res,next){
    return res.render("login", {title: "login"});
})


// POST /login 
//this route is when user submits login form
router.post('/', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
          //
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }  else {
          //login successful, put userId into session and redirect to app
        req.session.userId = user._id;
        return res.redirect('/app');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
