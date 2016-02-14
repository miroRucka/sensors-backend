/**
 * base config for express server. Configuration as json parser, path to static content and so on
 */
'use strict';
var logger = require('./logging');
var bodyParser = require('body-parser');
module.exports = function (app) {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(function (err, req, res, next) {
        logger.error(err);
        res.send(500, 'Something broke!');
    });
};