/**********for /register route************/
const express = require('express');
const router = express.Router();
const User = require("../models/users.js");

//GET /register
//this route shows user a signup form
router.get('/', (req,res,next) => {
   return res.render("register", {title: "register"});
});

//POST /register
//this route is when user submits a signup form
router.post('/', (req,res,next) => {
    //check if user filled out everything
    if(req.body.email &&
        req.body.userName&&
        req.body.password&&
        req.body.confirmPassword)
    {
        //confirm that user typed same password twice
        if(req.body.password !== req.body.confirmPassword)
        {
            var err = new Error('Passwords do not match');
            err.status = 400;
            return next(err);
        }
        
        //create object with form input
        var userData = {
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password,
            subjects: [ //Note: this should be input from user.
                {subjectName: "computer science", timeGoal: 120},
                {subjectName: "math", timeGoal: 110},
                {subjectName: "quantum mechanics", timeGoal: 100},
                {subjectName: "physics", timeGoal: 90},
                {subjectName: "biology", timeGoal: 80}
            ],
            profileStatus: "public", //default value. user can change this later
            profileImage: "http://materializecss.com/images/motion.png"
        }
        console.dir(userData);
        //use Schema's 'create' method to insert document into Mongo
        User.create(userData,(error,user)=> {
            if(error)
                return next(error);
            else{
                //login successful, add userId into session and then redirect
                req.session.userId = user._id;
                return res.redirect("/profile")
            }
        })
    }else{  //if there's an error
        var err = new Error('All fields required');
        err.status = 400;
        return next(err);
    }
});

module.exports = router;