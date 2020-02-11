const express = require('express');
const app = express();
var fs = require('fs');
var cors = require('cors');
var cookie = require('cookie-parser');
const port = 82;

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

const server = app.listen(port, () => console.log('[STARTUP] RDM_AppServer online on port ' + port))

app.get("/", function(req, res) {
  res.render("index");
});
