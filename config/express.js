/**
 * base config for express server. Configuration as json parser, path to static content and so on
 */
'use strict';
var logger = require('./logging');
module.exports = function (app) {
    app.use(function (err, req, res, next) {
        logger.error(err);
        res.send(500, 'Something broke!');
    });
};