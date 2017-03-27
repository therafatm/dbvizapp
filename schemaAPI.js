var express = require('express');
var router = express.Router();
var mysql = require('mysql');

// Mysql stuff
var columnsQuery = 'SELECT table_name, column_name, column_key, data_type FROM information_schema.columns WHERE table_schema=?;';
var keysQuery = 'SELECT table_name, column_name, referenced_table_name, referenced_column_name, constraint_name FROM information_schema.key_column_usage WHERE table_schema=?;';

// Can do this
// var connection = mysql.createConnection('mysql://user:pass@host/wordpress');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.route('/').get(function (req, res, next) {

    var results = {foreignKeys: []};
    console.log("in schemaAPI");
    console.log(req.query);

    // Attempt to parse the java source code from this directory.
    var callJava = new Promise( (resolve,reject) => {
        var spawn = require('child_process').spawn;
        var compile = spawn('javac', ['Count.java']);

        compile.on('close', ()=>{
            var run = spawn('java', ['Count']);
            run.stdout.on("data", (data)=>{
                console.log(data);
                resolve(data.toString());
            });
            run.on('close', () =>{
                console.log("Program process " + run.pid + " exited.");
            });
        });

        compile.on('close', () => {
            console.log("Compiler process " + compile.pid + " exited.");
        })
    })

    callJava.then( (parsedKeys) => {
        results.foreignKeys = results.foreignKeys.concat(JSON.parse(parsedKeys));
        return;
    }, (err) => {
        console.error("Could not parse foreign keys from the given directory " + req.query.sourceCodeDir);
        console.error(err);
        return;
    }).then( () => {
        var connection = mysql.createConnection({
            host: req.query.host,
            user: req.query.username,
            password: req.query.password,
            database: 'information_schema',
            port: req.query.port
        });

        connection.connect(function(err) {
            if(err) {
                // handle connection errors.
                console.error("Error connecting to mysql.");
                console.error(err);
                res.status(500).json({success: false, data: err, message: "Error connecting to MySQL server. Check your connection parameters."});
            } else {
                console.log("Successfully connected.");
                connection.query(columnsQuery, [req.query.database], function(err, rows, fields) {
                    if (err) {
                        console.log('error: ' + err);
                        connection.end();
                    } else {
                        results.tablesAndCols = rows;
                        connection.query(keysQuery, [req.query.database], function(err, rows, fields) {
                            if (err) {
                                console.log('error: ' + err);
                                connection.end();
                            } else {
                                results.foreignKeys = results.foreignKeys.concat(rows);
                                connection.end();
                                return res.json(results);
                            }
                        });
                    }
                });
            }
        });
    })

});

module.exports = router;