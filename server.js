var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var port = process.env.PORT || 8000;
var path = require('path');
var app = express();
var projectAPI = require('./projectAPI');
var schemaAPI = require('./schemaAPI');

app.use('/views', express.static(__dirname + '/views'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
	next();
});

// log all requests
app.use(morgan('dev'));

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

// set up the project REST endpoint
app.use('/api/project', projectAPI);
app.use('/api/schema', schemaAPI);

app.listen(port, function(){
	console.log("Server listening on port " + port + " !");
});
