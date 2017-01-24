var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var port = process.env.PORT || 8080;
var path = require('path');
var app = express();

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
})

app.listen(port, function(){
	console.log("Server listening on port" + port + " !");
})

var schema_name = 'test_db';

var columns_query = 'SELECT table_name, column_name, column_key, data_type FROM information_schema.columns WHERE table_schema="' + schema_name + '";';

var keys_query = 'SELECT table_name, column_name, referenced_table_name, referenced_column_name FROM information_schema.key_column_usage WHERE table_schema="' + schema_name + '";';

var mysql = require('mysql');

// These are the connection parameters that will be configurable.
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'information_schema'
});

connection.connect();

connection.query(columns_query, function(err, rows, fields) {
    if (!err)
	console.log('query result: ', rows);
    else
	console.log('error: ', err);
});

connection.end();
