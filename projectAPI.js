var express = require('express')
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.route('/')
  .get(function (req, res) {
    if(!!req.query.id){
      res.send(`returning project with id ${req.query.id}`)
    } else {
      res.send('returning all projects')
    }
  })
  .post(function (req,res) {
    res.send(`created project with id ${null}`)
  })
  .put(function (req,res){
    if(!!req.query.id){
      res.send(`updated project with id ${null}`)
    } else {
      res.status(400).send(`Must provide project id to update a project`)
    }
  })
  .delete(function (req,res) {
    if(!!req.query.id){
      res.send(`deleted project with id ${null}`)
    } else {
      res.status(400).send(`Must provide project id to delete a project`)
    }
  })

module.exports = router