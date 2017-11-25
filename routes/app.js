/**********for /login route************/
const express = require('express');
const router = express.Router();
const User = require("../models/users.js");



//GET /app
//this is a protected page. Only show if user is signed up
//default route /app, with no parameters specified
//NOV 22 Note: this route needs work
router.get('/', function(req,res,next){
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
//Nov 24 update: this route works, try not to change unless u have to
router.post('/', function(req, res, next) {
    
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


module.exports = router;