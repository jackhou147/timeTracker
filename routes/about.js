/**********for /about route************/
/*NOTE: "/about" has been declared in app.js file, so in this file we only 
need to use "/";     https://teamtreehouse.com/library/modular-routes*/
const express = require('express');
const router = express.Router();


router.get("/", function(req,res,next){
    return res.render('about', { title: 'about' });
});

module.exports = router;