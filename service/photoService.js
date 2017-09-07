/**
 * base service for work with point
 * @type {_|exports}
 * @private
 */
var Photos = require('../models/photoModel').photosModel;
var Promise = require("promise");
var _ = require('lodash');
var logger = require('../config/logging');

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


    return {
        save: _save
    }
};