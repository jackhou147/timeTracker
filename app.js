//Note: this is our main app js file that we start the app from
//Ex: "node app.js" starts the server

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var session = require("express-session");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());

//use sessions to track logins
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false
}))


//mongodb connection
mongoose.connect(`mongodb://${process.env.IP}:27017/timetracker`);
var db = mongoose.connection;
//mongo error
db.on('error',console.error.bind(console, 'connection error: '));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//serve static file
app.use("/static",express.static("public"));
// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
const mainroutes = require('./routes/index.js'),
      aboutRoutes = require("./routes/about.js"),
      registerRoutes = require("./routes/register.js"),
      profileRoutes = require("./routes/profile.js"),
      loginRoutes = require("./routes/login.js"),
      appRoutes = require("./routes/app.js");
app.use(mainroutes);
app.use("/about", aboutRoutes);
app.use("/register", registerRoutes);
app.use("/profile",profileRoutes);
app.use("/login",loginRoutes);
app.use("/app",appRoutes);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 8080
app.listen(8080, function () {
  console.log('Express app listening on port 8080');
});
