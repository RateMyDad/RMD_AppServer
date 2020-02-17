const express = require('express');
const app = express();
var router = express.Router();
var cors = require('cors');
var bcrypt = require('bcrypt');
const port = 82;

//---MONGOOSE & MONGODB SETUP---//
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/ratemydad", {useNewUrlParser: true});
var db = mongoose.connection
db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', function(){
  console.log("established DB connection.");
});

const DadProfile = require('./models/DadProfile');
const User = require('./models/User');

//---Set view engine & directory mappings (if sending HTML pages)---//
app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/js', express.static(__dirname + '/src/js/'));
app.use('/css', express.static(__dirname + '/src/css/'));
app.use('/font', express.static(__dirname + '/src/font/'));
app.use('/img', express.static(__dirname + '/src/img/'));

//---Other misc config---//
app.use(express.json());

//---Enable routing for configured endpoints---///
app.use("/", router);
app.use("/dad_profile/create", router);

//Run server
const server = app.listen(port, () => console.log('[STARTUP] RDM_AppServer online on port ' + port))

///---DAD_PROFILE:CREATE (POST)---///
router.post("/dad_profile/create", function(req, res, next) {
  var params = req.body.params;
  var name = params.name

  if(name.first != undefined && name.last != undefined) {
    console.log("recieved request to create: " + name.first + " " + name.last);
  }

  var dad = new DadProfile({
    name: {first: name.first, last: name.last}, skills : {grill: 3, bags: 3}
  });

  dad.save()
  res.send(dad)

})

///---INDEX (POST)---///
//Currently for testing, provide a dad first name in body.params and it returns a matching dad from DB
router.post("/", function(req, res, next) {

  var params = req.body.params

  console.log("Params: " + params)

  DadProfile.find({'name.first': params.name.first}, function(err, docs) {
    res.send(docs)
  })

  //res.render("index");
});

router.post("/register", function(req, res, next) {
  try {

    console.log("/register: " + req.body.username);
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    var user = new User(req.body);
    var result = user.save();
    res.send(result);

  } catch (error) {

    res.status(500).send(error)

  }
});

router.post("/login", async function(req, res, next) {
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
    return res.status(200).send({message: "Logged in."});

  } catch (error) {
    console.log(error);
    res.status(500).send(error);

  }
})
