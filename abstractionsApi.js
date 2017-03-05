var express = require('express');
var router = express.Router();
var pg = require('pg');
var config = require('./dbconfig.json');

const client = new pg.Client(config);
client.connect();

router.route('/:projectid')
  
  //GET all abstractions for a particular project
  .get(function (req, res){
    const results = [];
    const id = req.params.projectid;    

    // Get a Postgres client from the connection pool
    pg.connect(config, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Select Data
      const query = client.query('SELECT * FROM abstractions WHERE projectid = ' + id);
      // Stream results back one row at a time
      query.on('row', (row) => {
        results.push(row);
      });
      // After all data is returned, close connection and return results
      query.on('end', () => {
        done();
        return res.json(results);
      });
    });
  })


    .delete(function(req, res){

    const results = [];
    // Grab data from the URL parameters
    const id = req.params.projectid;
    // Get a Postgres client from the connection pool
    console.log(id);
    pg.connect(config, (err, client, done) => {
      // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }
        console.log("Connected to db");
        // SQL Query > Delete Data
        client.query('DELETE FROM abstractions WHERE projectid = ' + id);
        var query = client.query('SELECT * FROM abstractions ORDER BY aid ASC');
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
          return res.json(results);
        });
      });
    })

  //Add an abstraction for a particular project
  .post(function(req, res, next){
    const results = [];
    const id = req.params.projectid;    

    const modelString = JSON.stringify(req.body.model);
    console.log(modelString);

    // Grab data from http request
    // Get a Postgres client from the connection pool
    pg.connect(config, (err, client, done) => {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query('INSERT INTO abstractions (modelid, model, projectid) VALUES ($1, $2, $3)',
          [req.body.modelid, modelString, req.body.projectid]);        
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM abstractions ORDER BY aid ASC');
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
          return res.json(results);
        });
      });
  });

router.put('/:projectid/:modelid', function(req, res){

  const results = [];
  const pid = req.params.projectid;    
  const modelid = req.params.modelid;
  console.log(pid);
  console.log(modelid);

  const modelString = JSON.stringify(req.body.model);
  console.log(modelString);

  // Get a Postgres client from the connection pool
  pg.connect(config, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    //console.log("I am here now");
    client.query('UPDATE abstractions SET model=$1 WHERE projectid = $2 AND modelid = $3',
    [modelString, pid, modelid]);

    var query = client.query('SELECT * FROM abstractions ORDER BY aid ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

//get particular model abstraction for a project
router.get('/:projectid/:modelid', function (req, res, next){

  const results = [];
  const pid = req.params.projectid;    
  const modelid = req.params.modelid;

  // Get a Postgres client from the connection pool
  pg.connect(config, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM abstractions WHERE projectid = $1 and aid = $2',
      [pid, modelid]);

    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;