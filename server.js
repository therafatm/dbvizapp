var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var port = 8080 || process.env.PORT;
var path = require('path');
var app = express();

app.use('/js', express.static(__dirname + '/js'));
app.use('/views', express.static(__dirname + '/views'));

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
})

app.listen(8080, function(){
	console.log("Server listening on port 8080!")
})