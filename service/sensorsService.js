/**
 * base service for work with point
 * @type {_|exports}
 * @private
 */
var Sensors = require('../models/sensorsModel').sensorsModel;
var Promise = require("promise");
var _ = require('lodash');
var logger = require('../config/logging');
var messages = require('../config/messages');
var exists = require('../utils/exists');

module.exports = function () {

    var _find = function _find() {
        return new Promise(function (resolve, reject) {
            Sensors.find({}, {}, {}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(_.orderBy(data, ['timestamp'], ['desc']));
                }
            });
        });
    };

    var _findLast = function _findLast(pointId) {
        return new Promise(function (resolve, reject) {
            var query = {locationId: {'$eq': pointId}};
            Sensors.find(query, {}, {sort: {'timestamp': -1}, limit: 1}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _find12Hour = function _find12Hour(pointId, maxData) {
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
                timestamp: {'$gte': _start(), '$lt': _end()},
                locationId: {'$eq': pointId}
            };
            Sensors.find(query, {}, {sort: {'timestamp': -1}}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(_reduceData(data, maxData || 30));
                }
            });
        });
    };

    var _findToday = function _findToday(pointId) {
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
                timestamp: {'$gte': _start(), '$lt': _end()},
                locationId: {'$eq': pointId}
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

    var _findMonth = function _findMonth(pointId) {
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
                timestamp: {'$gte': _start(), '$lt': _end()},
                locationId: {'$eq': pointId}
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

    var _findTimeIntervalAvg = function (start, end, pointId) {
        return new Promise(function (resolve, reject) {
            var query = {
                timestamp: {'$gte': new Date(start), '$lt': new Date(end)},
                locationId: {'$eq': pointId}
            };
            Sensors.find(query, {}, {}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    var avgData = _avgData(data);
                    logger.debug(avgData);
                    resolve(avgData);
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

    var _count = function _count(pointId) {
        return new Promise(function (resolve, reject) {
            var query = exists(pointId) ? {
                locationId: {'$eq': pointId}
            } : {};
            Sensors.count(query, function (err, count) {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    };

    var _avgData = function (data) {
        var filtrated = _.filter(data, function (item) {
            return _exists(item.pressure) && _exists(item.humidity) && _exists(item.temperature) && item.humidity < 100;
        });
        return {
            count: filtrated.length,
            pressure: _.meanBy(filtrated, function (o) {
                return o.pressure;
            }),
            humidity: _.meanBy(filtrated, function (o) {
                return o.humidity;
            }),
            temperature: [],
            full: filtrated
        }
    };

    var _reduceData = function (data, maxItem) {
        var result = [];
        var getNotEmptyLength = function (chartData) {
            return _exists(chartData) ? _.filter(chartData, function (item) {
                return _exists(item.humidity) && _exists(item.temperature)
            }).length : 0;
        };
        var chartDataLength = getNotEmptyLength(data);
        var mod = chartDataLength > maxItem ? (chartDataLength / maxItem) : 0;
        mod = Math.round(mod);
        _.each(data, function (item, index) {
            var canPush = mod === 0 || (index % mod) == 0;
            if (canPush) {
                result.push(item);
            }
        });
        return result;
    };

    var _findAllPointIds = function (cache) {
        return new Promise(function (resolve, reject) {
            cache.get("allPointsId", function (err, value) {
                if (!_.isUndefined(value) && !_.isEmpty(value) && !err) {
                    resolve(value);
                } else {
                    Sensors.find().distinct('locationId', function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            var result = _getLocalizedPointId(data);
                            cache.set("allPointsId", result, 600);
                            resolve(result);
                        }
                    });
                }
            });
        });
    };

    var _getLocalizedPointId = function (pointIds) {
        var result = [];
        _.each(pointIds, function (pointId) {
            var localized = _.isUndefined(messages[pointId]) ? pointId : messages[pointId];
            var newPointId = {
                id: pointId,
                localized: localized
            };
            result.push(newPointId);
        });
        return result;
    };

    var _exists = exists

    return {
        save: _save,
        find: _find,
        findLast: _findLast,
        find12Hour: _find12Hour,
        findToday: _findToday,
        findMonth: _findMonth,
        findTimeIntervalAvg: _findTimeIntervalAvg,
        count: _count,
        findAllPointIds: _findAllPointIds
    }
};