var express = require('express');
var mongoose = require('mongoose');
var app = express();
var expressConfig = require('./config/express');
var http = require('http');
var server = http.createServer(app);
var logger = require('./config/logging');
var port = 8082;
var sensorService = require("./service/sensorsService")();
var photoService = require("./service/photoService")();
var config = require('./config/sensors.json');
var exists = require('./utils/exists');
var NodeCache = require("node-cache");
var cache = new NodeCache();
var stompService = require('./service/stompService')();
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var fs = require('fs');

var stompMessageClient;
stompService.connect(function (sessionId, client) {
    stompMessageClient = client;
});


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
    stompMessageClient.disconnect();
});
process.on('uncaughtException', function (err) {
    logger.error('Caught exception: ', err);
});

/**
 * restfull api
 */
var router = express.Router();

var securityFilter = function (req, res, next) {
    logger.info('sec...');
    var auth = req.headers['authorization'];
    if (env === 'dev') {
        next();
    } else if (auth && auth === config.auth) {
        next();
    } else {
        res.sendStatus(401);
    }
};

var pointIdValidator = function (req, res) {
    if (!exists(req.params) || !exists(req.params.pointId)) {
        //Unprocessable Entity
        res.sendStatus(422);
    }
}
var DefaultResponse = function (res) {
    DefaultResponse.prototype.ok = function (data) {
        res.json(data);
    };
    DefaultResponse.prototype.err = function (err) {
        logger.error(err);
        res.json({message: 'err ' + err});
    };
};


router.all("/*", securityFilter, function (req, res, next) {
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

router.get('/sensors/:pointId/last', function (req, res) {
    pointIdValidator(req, res);
    var response = new DefaultResponse(res);
    var pointId = req.params.pointId;
    sensorService.findLast(pointId).then(response.ok, response.err);
});

/*@depricated*/
router.get('/sensors/last', function (req, res) {
    var response = new DefaultResponse(res);
    sensorService.findLast("location_001").then(response.ok, response.err);
});

router.get('/sensors/:pointId/last/12hour', function (req, res) {
    pointIdValidator(req, res);
    var response = new DefaultResponse(res);
    var pointId = req.params.pointId;
    sensorService.find12Hour(pointId).then(response.ok, response.err);
});

router.get('/sensors/:pointId/today', function (req, res) {
    pointIdValidator(req, res);
    var response = new DefaultResponse(res);
    var pointId = req.params.pointId;
    sensorService.findToday(pointId).then(response.ok, response.err);
});

router.get('/sensors/:pointId/month', function (req, res) {
    pointIdValidator(req, res);
    var response = new DefaultResponse(res);
    var pointId = req.params.pointId;
    sensorService.findMonth(pointId).then(response.ok, response.err);
});

router.get('/sensors/:pointId/count', function (req, res) {
    pointIdValidator(req, res);
    var response = new DefaultResponse(res);
    var pointId = req.params.pointId;
    sensorService.count(pointId).then(response.ok, response.err);
});

router.get('/sensors/count', function (req, res) {
    var response = new DefaultResponse(res);
    sensorService.count().then(response.ok, response.err);
});

router.get('/sensors/all-points', function (req, res) {
    var response = new DefaultResponse(res);
    sensorService.findAllPointIds(cache).then(response.ok, response.err);
});

router.get('/sensors/:pointId/avg/time-interval', function (req, res) {
    pointIdValidator(req, res);
    var response = new DefaultResponse(res);
    var pointId = req.params.pointId;
    sensorService.findTimeIntervalAvg(req.query.start, req.query.end, pointId).then(response.ok, response.err);
});

router.post('/sensors', function (req, res) {
    var sensors = req.body;
    console.log(sensors);
    var ok = function (result) {
        logger.info('result saving process... ok');
        res.json({message: 'save ok'});
    };
    var response = new DefaultResponse(res);
    sensorService.save(sensors).then(ok, response.err);

});

router.put("/sensors/photo/:pointId", upload.single('file'), function (req, res) {
    pointIdValidator(req, res);
    fs.readFile(req.file.path, function (err, data) {
        var ok = function (data) {
            logger.info('photo saving process... ok');
            res.json({message: 'photo with id ' + req.params.pointId + ' saved.'});
            data.photo = {};
            stompMessageClient.publish('/queue/photo-uploaded', JSON.stringify(data));
            stompMessageClient.publish('/topic/photo-uploaded', JSON.stringify(data));
        };
        photoService.save({
            locationId: req.params.pointId,
            photo: {
                data: data
            }
        }).then(ok, new DefaultResponse(res).err);
    });
});

router.get('/sensors/photo/:pointId/last', function (req, res) {
    pointIdValidator(req, res);
    var response = new DefaultResponse(res);
    var pointId = req.params.pointId;
    var ok = function (data) {
        res.json(data[0]);
    };
    photoService.findLast(pointId).then(ok, response.err);
});

app.get('/sensors/photo/:photoId', function (req, res) {
    var response = new DefaultResponse(res);
    var photoId = req.params.photoId;
    logger.info('read photo with id ' + photoId);
    var ok = function (data) {
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(data.photo.data);
    };
    photoService.readPhoto(photoId).then(ok, response.err);
});

app.use('/api', router);


logger.info("our web server started, congratulation and have a nice day for every one - port:" + port + " enviroment develop? " + env);
