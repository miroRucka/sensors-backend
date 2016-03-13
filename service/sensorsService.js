/**
 * base service for work with point
 * @type {_|exports}
 * @private
 */
var Sensors = require('../models/sensorsModel').sensorsModel;
var Promise = require("promise");
var _ = require('lodash');
var logger = require('../config/logging');

module.exports = function () {

    var _find = function _find() {
        return new Promise(function (resolve, reject) {
            Sensors.find({}, {}, {sort: {'timestamp': -1}}, function (err, data) {
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
            Sensors.find({}, {}, {sort: {'timestamp': -1}, limit: 1}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _find12Hour = function _find12Hour() {
        var date = new Date();
        return new Promise(function (resolve, reject) {
            var _start = function () {
                var d = new Date();
                d.setHours(date.getHours() - 12);
                return d;
            };
            var _end = function () {
                return date;
            };
            var query = {
                timestamp: {'$gte': _start(), '$lt': _end()}
            };
            Sensors.find(query, {}, {sort: {'timestamp': -1}}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(_reduceData(data, 30));
                }
            });
        });
    };

    var _findToday = function _findToday() {
        return new Promise(function (resolve, reject) {
            var _start = function () {
                var d = new Date();
                d.setHours(0, 0, 0, 0);
                return d;
            };
            var _end = function () {
                var d = new Date();
                d.setHours(23, 59, 59, 999);
                return d;
            };
            var query = {
                timestamp: {'$gte': _start(), '$lt': _end()}
            };
            Sensors.find(query, {}, {sort: {'timestamp': -1}}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _findMonth = function _findMonth() {
        return new Promise(function (resolve, reject) {
            var date = new Date(), y = date.getFullYear(), m = date.getMonth();
            var _start = function () {
                var d = new Date(y, m, 1);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            var _end = function () {
                var d = new Date(y, m + 1, 0);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            var query = {
                timestamp: {'$gte': _start(), '$lt': _end()}
            };
            Sensors.find(query, {}, {sort: {'timestamp': -1}}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _save = function (newSensorsData) {
        return new Promise(function (resolve, reject) {
            new Sensors(newSensorsData).save(function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _count = function _count() {
        return new Promise(function (resolve, reject) {
            Sensors.count({}, function (err, count) {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    };

    var _reduceData = function (data, maxItem) {
        var result = [];
        var getNotEmptyLength = function (chartData) {
            return _exists(chartData) ? _.filter(chartData, function (item) {
                return _exists(item.pressure) && _exists(item.humidity) && _exists(item.temperature)
            }).length : 0;
        };
        var chartDataLength = getNotEmptyLength(data);
        var mod = chartDataLength > maxItem ? (chartDataLength / maxItem) : 0;
        _.each(data, function (item, index) {
            var canPush = mod === 0 || (index % mod) < 1;
            if (canPush) {
                result.push(item);
            }
        });
        return result;
    };

    var _exists = function (input) {
        return !_.isUndefined(input) && !_.isNull(input);
    };

    return {
        save: _save,
        find: _find,
        findLast: _findLast,
        find12Hour: _find12Hour,
        findToday: _findToday,
        findMonth: _findMonth,
        count: _count
    }
};