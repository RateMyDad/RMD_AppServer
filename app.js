const express = require('express');
var _ = require('lodash');
const app = express();
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var config = require('./config')
var session = require('express-session');
var jwt = require('jsonwebtoken');

const port = 82;

//---MONGOOSE & MONGODB SETUP---//
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/ratemydad", {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection
db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', function(){
  console.log("established DB connection.");
});

//---Load Mongoose Models---//
const DadProfile = require('./models/DadProfile');
const User = require('./models/User');

//---Other misc config---//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(session({ secret: 'peepeepoopoomommygrandma', cookie: { maxAge: 60000}, username: undefined}));
//---Enable routing for configured endpoints---///
app.use("/", router);
app.use("/user/register", router);
app.use("/user/login", router);
app.use("/user/check_status", router);
app.use(require("./protected_routes"));

//---AUTH SCHTUFF---///
//https://github.com/auth0-blog/nodejs-jwt-authentication-sample
function createIdToken(user) {
  var tok =  jwt.sign({
    username: user.username,
    aud: config.audience,
    iss: config.issuer
  }, config.secret, { expiresIn: '5h' });
  return tok
}

function createAccessToken() {
  return jwt.sign({
    iss: config.issuer,
    aud: config.audience,
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    scope: 'full_access',
    sub: "lalaland|gonto",
    jti: genJti(), // unique identifier for the token
    alg: 'HS256'
  }, config.secret);
}

// Generate Unique Identifier for the access token
function genJti() {
  let jti = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 16; i++) {
      jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return jti;
}


///---HELPER FUNCTIONS---///
async function user_exists(username) {
  var user = await User.findOne({"username": username}).exec();
  console.log("[user_exists] " + username + ": " + (user != null))
  return (user != null)
}

///---USER:REGISTER (POST)---///
router.post("/user/register", async function(req, res, next) {

  try {

    console.log("/register: " + req.body.username);
    console.log("password:" + req.body.password);
      var user = User.findOne({ "username": req.body.username }).exec(function(err, result) {
        if(result == undefined) {
          req.body.password = bcrypt.hashSync(req.body.password, 10);
          var user = new User({
            "username": req.body.username,
            "password": req.body.password,
            "profile": {
              "parent_profile": null,
              "user_profile": null
            }
          });
          var result = user.save();

          res.status(201).send({
            id_token: createIdToken(user),
            access_token: createAccessToken()
          });

        } else {
          res.status(400).send({message: "Username taken."})
        }
      });

  } catch (error) {

    res.status(500).send(error)

  }

});

///---USER:LOGOUT (GET)---///
router.get("/user/logout", async function(req, res, next) {
  if(req.session.username == undefined) {
    res.status(400).send({message: "You are not logged in!"});
  } else {
    console.log("Username: " + req.session.username);
    var user = req.session.username;
    req.session.destroy();
    res.status(200).send({messsage: "Sucessfully logged out " + user});
  }
})

///---USER:CHECK_STATUS (GET)---///
router.get("/user/check_status", async function(req, res, next) {
  console.log("Session in check_status:");
  console.log(req.session);
  if (req.session.username == undefined) {
    res.status(400).send({message: "You must be logged in to use this feature."})
  } else {
    await User.findOne({"username": req.session.username}).exec(async function(err, result) {
      if(result.profile.parent_profile != null) {
        res.status(400).send({message: "You already have a profile created!"});
      }

      else {
        res.status(200).send({message: "Create your dad profile here."});
      }
    });

    req.session.save();
  }
})

///---USER:LOGIN (POST)---///
router.post("/user/login", async function(req, res, next) {
  try {
    console.log("/login " + req.body.username)
    var user = await User.findOne({ "username": req.body.username }).exec()

    if(!user) {
      //User does not exist
      return res.status(400).send({message: "User not found"});
    }

    if(!bcrypt.compareSync(req.body.password, user.password)) {
      //Bad password
      return res.status(400).send({message: "Invalid login"});
    }

    //If you get here, successful login
    console.log("\t sending API tokens")
    res.status(201).send({
      id_token: createIdToken(user),
      access_token: createAccessToken()
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

const server = app.listen(port, () => console.log('[STARTUP] RDM_AppServer online on port ' + port))
