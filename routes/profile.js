/**********for /profile route************/
const express = require('express');
const router = express.Router();
const User = require("../models/users.js");
var mongoose = require("mongoose");
var MongoClient = require('mongodb').MongoClient;

// GET /profile
//this is a protected page: NOT accessible unless user is logged in.
router.get("/", function(req,res,next){
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
                    profileStatus: user.profileStatus,
                    profileImage: user.profileImage
                });
            }
        })
    
})


//POST /profile, add subject
router.post("/", function(req,res,next){
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


module.exports = router;