//Nov 24 Note: we don't ask the user for his actual name anymore, i think it's 
//better to ask for username 

const express = require('express');
const router = express.Router();
const User = require("../models/users.js");
var mongoose = require("mongoose");

var MongoClient = require('mongodb').MongoClient;

// GET /
//homepage 
//this page is the main page, for advertisement purposes
router.get('/', function(req, res, next) {
    return res.redirect("/login");
});

//GET
//about page
router.get("/about", function(req,res,next){
    return res.render('about', { title: 'about' });
})


//GET /register
//this route shows user a signup form
router.get('/register', (req,res,next) => {
   return res.render("register", {title: "register"});
});

//POST /register
//this route is when user submits a signup form
router.post('/register', (req,res,next) => {
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
            profileStatus: "public" //default value. user can change this later
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



// GET /profile
//this is a protected page: NOT accessible unless user is logged in.
router.get("/profile", function(req,res,next){
    //if user is not logged in, send an error message
    if(!req.session.userId){
        let err = new Error("You are not authorized to access this page.");
        err.status = 403;
        return next(err);
    }
    //if user is logged in, retrieve user data from database
    User.findById(req.session.userId)
        .exec(function(error,user){
            //error checking
            if(error){
                return next(error)
            }else{
                return res.render("profile", {
                    title: "profile", 
                    userName: user.userName,
                    profileStatus: user.profileStatus
                });
            }
        })
    
})

//POST /profile, add subject
router.post("/profile", function(req,res,next){
    if(req.body.subjectName && req.body.timeGoal){
        const subjectName = req.body.subjectName;
        const timeGoal = req.body.timeGoal;
        console.log(req.body.subjectName, req.body.timeGoal);
        MongoClient.connect(`mongodb://${process.env.IP}:27017/timetracker`, function(err, db) {
            // Create a collection we want to drop later
            var collection = db.collection('users');
            console.dir(collection);
            collection.updateOne(
                {name: req.cookies.username},
                {$push: 
                    {
                        subjects: [{subjectName: subjectName, timeGoal: timeGoal}]
                    }
                }
            )
        })
    }
    return next();
})

//GET /app
//this is a protected page. Only show if user is signed up
//default route /app, with no parameters specified
//NOV 22 Note: this route needs work
router.get('/app', function(req,res,next){
    //if user is not logged in, send an error message
    if(!req.session.userId){
        let err = new Error("You are not authorized to access this page.");
        err.status = 403;
        return next(err);
    }
    
    //if user is logged in, retrieve user data from database
    User.findById(req.session.userId)
        .exec(function(error,user){
            //error checking
            if(error){
                return next(error)
            }else{
                //user is found
                console.log(user);
                //----------------variables---------
                let subjectNames = [];
                
                //----------------process-----------
                //1. push all the subject names into subjectNames array
                subjectNames = user.subjects.map( obj => {
                    return obj.subjectName;
                })
                //2. render the page
                return res.render("app", {
                    subjectNames, 
                    title: 'app'
                })
                res.send("logged in");
            }
        })
})

// POST /app
//{time_passed and subject}
router.post('/app', function(req, res, next) {
    
    //----------------variables----------------
    const time_passed = req.body.timePassed;  
    const subjectName = req.body.subjectName;   //subject that the user is studying
    let oldTimeGoal;
    let newTimeGoal;
    //----------------process----------------
    User.findById(req.session.userId)
        .exec(function(error,user){
            if(error){
                return next(error);
            }else{
                //search for the subject, update the time goal
                for(var i=0; i<user.subjects.length; i++){
                    if(user.subjects[i].subjectName == subjectName){
                        oldTimeGoal = user.subjects[i].timeGoal;
                        newTimeGoal =  oldTimeGoal - time_passed;
                        User.update(
                            { _id: req.session.userId, "subjects.subjectName": subjectName },
                            { $set: { "subjects.$.timeGoal" : newTimeGoal } },
                            function(){
                                return res.send(`haha motherfucker you just sent some data: ${subjectName} ${time_passed}`);
                            }
                        );
                        break;
                    }
                }
            }
        })
});


//GET /login
//login page, renders a login form
router.get("/login", function(req,res,next){
    return res.render("login", {title: "login"});
})


// POST /login 
//this route is when user submits login form
router.post('/login', function(req, res, next) {
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


//POST /logout
//NOV 23 Note: logout route needs to be added
router.post('/logout', function(req,res,next){
    //add a log out route here: 
    
    //redirect to index page
    res.redirect('/');
})

module.exports = router;
