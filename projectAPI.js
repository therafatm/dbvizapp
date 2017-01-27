var express = require('express');
var router = express.Router();
var pg = require('pg');
//const connectionString = 'postgres://localhost:5432/test';
const connectionString = "postgres://ymaswrfichcpnv:2c09436d0c70aeba07699fd3829051d21320b766362add25b0b4a5b3b72b8f19@ec2-107-20-141-145.compute-1.amazonaws.com:5432/deitvncfhkbq6e";
//const client = new pg.Client(connectionString);
const client = new pg.Client(connectionString);
client.connect();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

//GET all projects
router.route('/')
  .get(function (req, res) {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Select Data
      const query = client.query('SELECT * FROM projects ORDER BY id ASC;');
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

  //Add project to DB
  .post(function(req, res, next){
  const results = [];
  // Grab data from http request
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({success: false, data: err});
      }
      // SQL Query > Insert Data
      client.query('INSERT INTO projects VALUES($1, $2)', [req.body.id, req.body.name]);
      // SQL Query > Select Data
      const query = client.query('SELECT * FROM projects ORDER BY id ASC');
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

router.delete('/:id', (req, res, next) => {

  const results = [];
  // Grab data from the URL parameters
  const id = req.params.id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM projects WHERE id=' + id);
    var query = client.query('SELECT * FROM projects ORDER BY id ASC');
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