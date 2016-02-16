var express = require('express');
var mongoose = require('mongoose');
var app = express();
var expressConfig = require('./config/express');
var http = require('http');
var server = http.createServer(app);
var logger = require('./config/logging');
var port = 8085;
var sensorService = require("./service/sensorsService")();
var config = require('./config/sensors.json');

server.listen(port);

/**
 * configure express server - add some middleware for json parsing and exception handling
 */
expressConfig(app);

/**
 * declare service for db operation
 * @type {exports}
 */
var env = process.argv[2];
require('./service/mongoService').service(mongoose).connect(env);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    logger.info("we're connected!");
});

/**
 * after crash process I close mongodb connection
 */
process.on('SIGINT', function () {
    logger.info('Application sensors shutting down!');
    mongoose.connection.close(function () {
        logger.info('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
process.on('uncaughtException', function (err) {
    logger.error('Caught exception: ', err);
});


/**
 * restfull api
 */
var router = express.Router();

var securityFilter = function(req, res, next) {
    var auth = req.headers['authorization'];
    if (auth && auth === config.auth) {
        next(); // allow the next route to run
    } else {
        // require the user to log in
        res.send(401);
    }
};

// Automatically apply the `securityFilter` middleware to all
// routes starting with `/`
router.all("/*", securityFilter, function(req, res, next) {
    next(); // if the middleware allowed us to get here,
            // just move on to the next route handler
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

router.get('/sensors', function (req, res) {
    var ok = function (data) {
        res.json(data);
    };
    var err = function (err) {
        logger.error(err);
        res.json({message: 'save err ' + err});
    };
    sensorService.find().then(ok, err);
});

router.post('/sensors', function (req, res) {
    var sensors = req.body;
    logger.info('sensors data', sensors);
    var ok = function (result) {
        logger.info('result saving process... ok');
        res.json({message: 'save ok '});
    };
    var err = function (err) {
        logger.error(err);
        res.json({message: 'save err ' + err});
    };
    sensorService.save(sensors).then(ok, err);

});

app.use('/api', router);


logger.info("our web server started, congratulation and have a nice day for every one - port:" + port + " enviroment develop? " + env);