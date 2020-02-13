const express = require('express');
const app = express();
var router = express.Router();
var cors = require('cors');
var cookie = require('cookie-parser');
const port = 82;

var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/ratemydad", {useNewUrlParser: true});
var db = mongoose.connection
db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', function(){
  console.log("established DB connection.");
});

const DadProfile = require('./DadProfile');

//IO config
//EJS config
app.set('view engine', 'ejs');
app.set('views', './views');

//Json and directory config
app.use(express.json());
app.use('/js', express.static(__dirname + '/src/js/'));
app.use('/css', express.static(__dirname + '/src/css/'));
app.use('/font', express.static(__dirname + '/src/font/'));
app.use('/img', express.static(__dirname + '/src/img/'));

//Other config
app.use(cors())
app.use(cookie())

app.use("/", router);
app.use("/dad_profile/create", router);

const server = app.listen(port, () => console.log('[STARTUP] RDM_AppServer online on port ' + port))

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

router.post("/", function(req, res, next) {

  var params = req.body.params

  console.log("Params: " + params)

  // var dad = new DadProfile({
  //   name: {first: "Bill", last: "Buttworth"}, skills: {grill: 3.4, bags: 4.5}
  // });

  //dad.save()

  DadProfile.find({'name.first': params.name.first}, function(err, docs) {
    res.send(docs)
  })

  //res.render("index");
});
