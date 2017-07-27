var _ = require('lodash');
var logger = require('../config/logging');
/**
 * horske.info
 * database service
 * @returns {{connect: _connect}}
 */
module.exports.service = function service(mongoose) {

    var _connect = function (env) {
        var _isDev = _.isUndefined(env) ? true : env === 'dev';
        var host = Boolean(_isDev) ? "localhost" : "localhost";
        var port = Boolean(_isDev) ? 27017 : 27017;
        var url = "mongodb://admin:DT3EK93t@" + host + ":" + port + "/sensors";
        logger.info('db connection url', url);
        return mongoose.connect(url, {
            server: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}},
            replset: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}}
        });
    };

    var _disconnect = function (cb) {
        cb = cb || function () {
            };
        mongoose.connection.close(function () {
            cb();
        });
    };

    return {
        connect: _connect,
        disconnect: _disconnect
    }

};
