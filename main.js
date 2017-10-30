/****CONSTANTES*****/
const express = require('express'),
  app = express(),
  config = require('./config/global.json'), // Global config file  
  UsersController = require("./controllers/UsersController"),
  ListsController = require("./controllers/ListsController"),
  TasksController = require("./controllers/TasksController"),
  SharingLinksController = require("./controllers/SharingLinksController"),
  bodyParser = require('body-parser'),
  auth = require("./services/auth.js")(),
  port = process.env.port || config.port

/****CONSTANTES*****/

/****CONFIGURATION****/
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(auth.initialize())

/****CONFIGURATION****/

/****ROUTES****/
var router = express.Router() // get an instance of the express Router
app.use('/api', router, UsersController, ListsController, TasksController, SharingLinksController)

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    res.header('Access-Control-Allow-Origin', '*') // TODO - Make this more secure!!
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    console.log('*****************************************************')
    next()
  })
  // test route to make sure everything is working (accessed at GET http://localhost:4000/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
})

/****ROUTES****/

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
