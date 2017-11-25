//users schema
//Note: information we need from the user at the time of registration: 
//1. username; 2. email; 3. password; 4. subjects 5. profileStatus(either public or private)
//Note: ask the user for email(not necessarily username because username is
//harder to remember than email) when logging in

var mongoose = require("mongoose")
var bcrypt = require("bcrypt");
var UserSchema = new mongoose.Schema({
    email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  },
  subjects: {
    type: Array,  
    /*subjects array looks like this: 
    [{subjectName: blablabla, timeGoal: blablabla},etc]*/
    required: false
  },
  profileStatus: {
    type: String,   //either "public" or "private"
    required: false
  }
})

//authenticate email and password against database documents
UserSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({ email: email })
      .exec(function (error, user) {
        //if there is an error
        if (error) {
          return callback(error);
        } else if ( !user ) { //if user is not found
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        //if user is found in the databse
        //compare the supplied password with the hashed version
        bcrypt.compare(password, user.password , function(error, result) {
          if (result === true) {
            //if correct password
            return callback(null, user);
          } else {
            //if incorrect password
            return callback();
          }
        })
      });
}

//hash password before saving to database
UserSchema.pre("save", function(next){
  var user = this;
  //hashing starts here
  bcrypt.hash(user.password, 10, (err,hash) => {
    console.log(user.password);
    if(err){
      return next(err);
    }
    //if no error, overwrite plain text password with generated hash
    user.password = hash;
    next();
  })
})

var User = mongoose.model('User', UserSchema);
module.exports = User; 