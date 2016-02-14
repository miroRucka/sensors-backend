var express = require('express');
var mongoose = require('mongoose');
var app = express();
var expressConfig = require('./config/express');
var http = require('http');
var server = http.createServer(app);
var logger = require('./config/logging');
var port = 8085;
var sensorService = require("./service/sensorsService")();

server.listen(port);

/**
 * configure express server - add some middleware for json parsing and exception handling
 */
expressConfig(app);

/**
 * declare service for db operation
 * @type {exports}
 */
require('./service/mongoService').service(mongoose).connect();
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

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

router.get('/sensors', function (req, res) {
    sensorService.find().then(function (data) {
        res.json(data);
    });
});

router.post('/sensors', function (req, res) {
    var sensors = req.body;
    logger.info('sensors data', sensors);
    sensorService.save(sensors).then(function (result) {
        logger.info('result saving process...', result);
    });
    res.json({message: 'hooray! welcome to our api!'});
});

app.use('/api', router);


logger.info("our web server started, congratulation and have a nice day for every one - port:" + port);