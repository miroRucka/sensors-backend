var winston = require('winston');
var rootPath = require('path').normalize(__dirname + '/..');


var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: false, timestamp: true, level: 'debug' }),
        new winston.transports.File({ filename: rootPath + '/debug.log', json: false, level: 'debug' })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: true, timestamp: true}),
        new winston.transports.File({ json: false, filename: rootPath + '/exceptions.log' })
    ],
    exitOnError: false
});

module.exports = logger;