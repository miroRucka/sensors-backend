/**
 * base service for work with point
 * @type {_|exports}
 * @private
 */
var Sensors = require('../models/sensorsModel').sensorsModel;
var Promise = require("promise");
var _ = require('lodash');
var logger = require('../config/logging');

module.exports = function() {

    var _find = function _find() {
        logger.info('sensorsService#find()');
        return new Promise(function (resolve, reject) {
            Sensors.find(function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _save = function (newSensorsData) {
        logger.info('sensorsService#save()');
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

    return {
        save: _save,
        find: _find
    }
};