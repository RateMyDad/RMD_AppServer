const express = require('express');
const app = express();
var router = express.Router();
var cors = require('cors');
var bcrypt = require('bcrypt');
var session = require('express-session');
const port = 82;

//---MONGOOSE & MONGODB SETUP---//
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/ratemydad", {useNewUrlParser: true});
var db = mongoose.connection
db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', function(){
  console.log("established DB connection.");
});

//---Load Mongoose Models---//
const DadProfile = require('./models/DadProfile');
const User = require('./models/User');

//---Other misc config---//
app.use(express.json());
app.use(session({ secret: 'peepeepoopoomommygrandma', cookie: { maxAge: 60000}, username: undefined}));
//---Enable routing for configured endpoints---///
app.use("/", router);
app.use("/dad_profile/create", router);
app.use("/user/register", router);
app.use("/user/login", router);

//Run server
const server = app.listen(port, () => console.log('[STARTUP] RDM_AppServer online on port ' + port))

///---HELPER FUNCTIONS---///
async function user_exists(username) {
  var user = await User.findOne({"username": username}).exec();
  console.log("[user_exists] " + username + ": " + (user != null))
  return (user != null)
}

async function getSkillScore(skills) {
  var total = 0

  total = total + (skills.grilling * 1.5)
  + (skills.cooking * 2)
  + (skills.bags)
  + (skills.softball)
  + (skills.coaching * 1.5)
  + (skills.generosity * 3)
  + (skills.looks * 1.5)
  + (skills.dad_factor * 2.5)
  + (skills.fantasy_football)
  + (skills.humor * 2.5)
  + (skills.emotional_stability * 2)
  + (skills.handiness * 3)
  + (skills.kids * 3)
  + (skills.stealth_food_preparation)
  + (skills.tech * 2)
  + (skills.furniture_assembly)
  + (skills.photography)

  return total
}

///---DAD_PROFILE:CREATE (POST)---///


router.post("/dad_profile/create", async function(req, res, next) {

  if(req.session.username == undefined){

    res.status(400).send({message: "You must be logged in to create a profile."});

  } else {

    User.findOne({"username": req.session.username}).exec(async function(err, result) {

        if(result.profile.parent_profile != null) {
          res.status(400).send({message: "You already have a profile created!"});
          return false;
        }
        //Test comment
        var exists = await user_exists(req.body.username);
        if(exists) {

          if(req.body.name.first != undefined && req.body.name.last != undefined) {

            console.log("[dad_profile/create] Profile creation for : " + req.body.name.first + " " + req.body.name.last)
            var skills = req.body.skills;

            var skillScore = await getSkillScore(skills);

            var dad = new DadProfile({
              name: {
                first: req.body.name.first,
                last: req.body.name.last
              },

              skills : {
                grilling: skills.grilling,
                cooking: skills.cooking,
                bags: skills.bags,
                softball: skills.softball,
                coaching: skills.coaching,
                generosity: skills.generosity,
                looks: skills.looks,
                dad_factor: skills.dad_factor,
                fantasy_football: skills.fantasy_football,
                humor: skills.humor,
                emotional_stability: skills.emotional_stability,
                handiness: skills.handiness,
                kids: skills.kids,
                stealth_food_preparation: skills.stealth_food_preparation,
                tech: skills.tech,
                furniture_assembly: skills.furniture_assembly,
                photography: skills.photography
              },

              location : {
                country: "United States",
                region: "US-Central"
              },

              meta: {
                rating: 0,
                skillScore: skillScore
              }

           });

            console.log("[dad_profile/create] Linking profile {" + req.body.name.first + " " + req.body.name.last + "} to user " + req.body.username);
            var user_toLink = await User.findOne({"username": req.body.username}).exec();
            user_toLink.profile.parent_profile = dad._id;

            dad.save();
            user_toLink.save();

            res.send(dad)

          } else {
            res.status(400).send({message: "Missing first and last name."});
          }

        } else {
          res.status(400).send({message: "User not found."});
        }
    });
  }
});

///---INDEX (POST)---///
//Currently for testing, provide a dad first name in body.params and it returns a matching dad from DB
router.post("/", function(req, res, next) {

  var params = req.body.params

  console.log("Params: " + params)

  DadProfile.find({'name.first': params.name.first}, function(err, docs) {
    res.send(docs)
  })

});

///---USER:REGISTER (POST)---///
router.post("/user/register", async function(req, res, next) {

  try {

    console.log("/register: " + req.body.username);
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
          res.status(200).send(user);
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
    var user = req.session.username;
    req.session.destroy();
    res.status(200).send({messsage: "Sucessfully logged out " + user});
  }
})

///---USER:LOGIN (POST)---///
router.post("/user/login", async function(req, res, next) {
  if(req.session.username != undefined) {
    res.status(200).send({message: "You are already logged in as " + req.session.username});
  } else {
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
      req.session.username = req.body.username;
      return res.status(200).send(user);

    } catch (error) {
      console.log(error);
      res.status(500).send(error);

    }

  }
})
