//Nov 24 Note: we don't ask the user for his actual name anymore, i think it's 
//better to ask for username 

const express = require('express');
const router = express.Router();
const User = require("../models/users.js");
var mongoose = require("mongoose");
var MongoClient = require('mongodb').MongoClient;

// GET /
//homepage 
router.get('/', function(req, res, next) {
    //if user is not logged in, redirect to /login
    if(!req.session.userId){
        return res.redirect("/login");
    }else{
        //if user is logged in, redirect to /app
        return res.redirect("/app");
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


module.exports = router;