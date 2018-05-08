/**
 * base service for work with point
 * @type {_|exports}
 * @private
 */
var Log = require('../models/logModel').logModel;
var Promise = require("promise");
var Client = require('node-rest-client').Client;
var client = new Client();
var logger = require('../config/logging');

module.exports = function () {

    var _save = function (logValue) {
        return new Promise(function (resolve, reject) {
            new Log({log: logValue}).save(function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _findRange = function _findRange(from, to) {
        return new Promise(function (resolve, reject) {
            var query = {
                timestamp: {'$gte': from, '$lt': to}
            };
            Log.find(query, {}, {sort: {'timestamp': 1}}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _findLast = function _findLast() {
        return new Promise(function (resolve, reject) {
            Log.find({}, {}, {sort: {'timestamp': -1}, limit: 1}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _startLog = function _startLog(ntAddress, interval) {
        var tick = function () {
            var args = {
                requestConfig: {
                    timeout: 3500,
                },
                responseConfig: {
                    timeout: 3500
                }
            };
            var req = client.get(ntAddress, args, function () {
                _save(1);
            });
            req.on('requestTimeout', function () {
                _save(0);
            });

            req.on('responseTimeout', function () {
                _save(0);
            });
            req.on('error', function () {
                _save(0);
            });
        };
        return setInterval(tick, interval);
    };

    return {
        save: _save,
        findRange: _findRange,
        startLog: _startLog
    }
};