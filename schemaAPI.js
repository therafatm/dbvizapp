var express = require('express');
var router = express.Router();
var mysql = require('mysql');

// Mysql stuff
var columnsQuery = 'SELECT table_name, column_name, column_key, data_type FROM information_schema.columns WHERE table_schema=?;';
var keysQuery = 'SELECT table_name, column_name, referenced_table_name, referenced_column_name FROM information_schema.key_column_usage WHERE table_schema=?;';

// Can do this
// var connection = mysql.createConnection('mysql://user:pass@host/wordpress');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})

router.route('/').get(function (req, res, next) {

    var results = {};

    console.log("in schemaAPI");
    console.log(req.query);

    var connection = mysql.createConnection({
        host: req.query.host,
        user: req.query.user,
        password: req.query.password,
        database: 'information_schema',
        port: req.query.port
    });

    connection.connect(function(err) {
        if(err) {
            console.log("Error connecting to mysql.");
        } else {
            console.log("Successfully connected.");
            connection.query(columnsQuery, [req.query.database], function(err, rows, fields) {
                if (err) {
                    console.log('error: ' + err);
                    connection.end();
                } else {
                    results.tablesAndCols = rows;
                    console.log("first query");
                    console.log(rows);
                    connection.query(keysQuery, [req.query.database], function(err, rows, fields) {
                        if (err) {
                            console.log('error: ' + err);
                            connection.end();
                        } else {
                            results.foreignKeys = rows;
                            console.log("second query");
                            console.log(rows);
                            connection.end();
                            return res.json(results);
                        }
                    })
                }
            });
        }
    });
});

module.exports = router;