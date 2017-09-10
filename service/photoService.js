/**
 * base service for work with point
 * @type {_|exports}
 * @private
 */
var Photos = require('../models/photoModel').photosModel;
var Promise = require("promise");
var _ = require('lodash');

module.exports = function () {

    var _save = function (newPhoto) {
        return new Promise(function (resolve, reject) {
            new Photos(newPhoto).save(function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _findLast = function (pointId) {
        return new Promise(function (resolve, reject) {
            var query = {locationId: {'$eq': pointId}};
            Photos.find(query, {_id: 1, locationId: 1, timestamp: 1}, {sort: {'timestamp': -1}, limit: 1}, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    var _readPhoto = function (id) {
        return new Promise(function (resolve, reject) {
            Photos.findById(id, {photo: 1}, function (err, data) {
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
        findLast: _findLast,
        readPhoto: _readPhoto
    }
};