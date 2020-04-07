//https://github.com/auth0-blog/nodejs-jwt-authentication-sample/blob/master/protected-routes.js
var express = require('express'),
    jwt     = require('express-jwt'),
    config  = require('./config');
    bodyParser = require('body-parser')

var app = module.exports = express.Router();
app.use(bodyParser.json())

const DadProfile = require('./models/DadProfile');
const User = require('./models/User');

// Validate access_token
var jwtCheck = jwt({
  secret: config.secret,
  audience: config.audience,
  issuer: config.issuer
});

// Check for scope
function requireScope(scope) {
  return function (req, res, next) {
      next();
  };
}

function getRatings() {
  DadProfile.find({}).sort('meta.skillScore').exec(function(err, docs) {
    if (!err) {
      console.log(docs);
      var count = 1;
      for (var i = docs.length - 1; i >= 0; i--) {
        docs[i].meta.rating = count;
        docs[i].save();
        count++;
      }
      console.log("--------------------------------------------");
      console.log(docs);
    }
    else {
      console.log(err);
    }
  })
}

async function user_exists(username) {
  var user = await User.findOne({"username": username}).exec();
  console.log("[user_exists] " + username + ": " + (user != null))
  return (user != null)
}


app.use('/api/protected', jwtCheck, requireScope('full_access'));

app.get('/api/protected/test', function(req, res) {
  res.status(200).send("Heyo");
});


app.get("/api/protected/dad_profile/ratings", function(req, res, next) {
  DadProfile.find({}).sort('meta.skillScore').exec(function(err, docs) {
    if (!err) {
      var count = 1;
      for (var i = docs.length - 1; i >= 0; i--) {
        docs[i].meta.rating = count;
        docs[i].save();
        count++;
      }

      console.log("--------------------------------------------");
      console.log(docs);

      res.status(200).send(docs);
    }

    else {
      console.log(err);
    }
  })
});

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
app.post("/api/protected/dad_profile/create", async function(req, res, next) {
  console.log("[/dad_profile/create]");
  console.log(req.user.username);
  await User.findOne({"username": req.user.username}).exec(async function(err, result) {

      if(result.profile.parent_profile != null) {
        res.status(400).send({message: "You already have a profile created!"});
        return false;
      }
      //Test comment
      var exists = await user_exists(req.user.username);
      if(exists) {
        console.log(req)
        console.log(req.body)
        if(req.body.name.first != undefined && req.body.name.last != undefined) {

          console.log("[dad_profile/create] Profile creation for : " + req.body.name.first + " " + req.body.name.last)
          var skills = req.body.skills;

          var zip = req.body.zip;

          var skillScore = await getSkillScore(skills);

          var dad = new DadProfile({
            username: req.body.username,

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

            zip: zip,

            location : {
              country: "United States",
              region: "US-Central"
            },

            meta: {
              rating: 0,
              skillScore: skillScore
            }

         });

          console.log("[dad_profile/create] Linking profile {" + req.body.name.first + " " + req.body.name.last + "} to user " + req.user.username);
          var user_toLink = await User.findOne({"username": req.user.username}).exec();
          user_toLink.profile.parent_profile = dad._id;

          dad.save();
          user_toLink.save();

          res.status(200).send(dad)

          getRatings();

        } else {
          res.status(400).send({message: "Missing first and last name."});
        }

      } else {
        res.status(400).send({message: "User not found."});
      }
  });

});

app.get("/api/protected/dad_profile/me", function(req, res, next) {
  console.log("[/dad_profile/me]")
  console.log(req.user)
    User.findOne({"username" : req.user.username}).exec(async function(err, result) {
      var profile_id = result.profile.parent_profile;
      console.log("[/dad_profile/me][" + req.user.username + "] profile id: " + profile_id)
      var dad = await DadProfile.findOne({"_id" : profile_id}).exec()
      res.status(200).send(dad)
    });
});

///---USER:CHECK_STATUS (GET)---///
app.get("/api/protected/user/check_status", async function(req, res, next) {
  console.log("Session in check_status:");
  await User.findOne({"username": req.user.username}).exec(async function(err, result) {
    if(result.profile.parent_profile != null) {
      res.status(400).send({message: "You already have a profile created!"});
    }

    else {
      res.status(200).send({message: "Create your dad profile here."});
    }
  });



})
