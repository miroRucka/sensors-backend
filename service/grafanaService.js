/**
 * Created by mito on 27. 3. 2018.
 */
var _ = require('lodash');
var logger = require('../config/logging');

module.exports = {
    temperatures: function (data, temperatureKey) {
        return _.map(data, function (r) {
            var tempeartures = r.temperature;
            var temperature = _.find(tempeartures, function (o) {
                return o.key === temperatureKey;
            });
            var timestamp = new Date(r.timestamp);
            return [_.isEmpty(temperature) ? 0 : temperature.value, timestamp.getTime()]
        });
    },
    otherDimension: function (data, dimension) {
        return _.map(data, function (r) {
            var result = r[dimension];
            var timestamp = new Date(r.timestamp);
            return [result, timestamp.getTime()]
        });
    },
    last: function (data, dimension, temperatureKey) {
        logger.info(dimension, temperatureKey);
        var result = data[dimension];
        logger.info(result);
        logger.info(dimension.indexOf('temperature'));
        if (dimension.indexOf('temperature') !== -1) {
            result = _.find(result, function (o) {
                return o.key === temperatureKey;
            });
            logger.info('this is a temperature', result);
        }
        var timestamp = new Date(data.timestamp);
        return [[result, timestamp.getTime()]]
    }
};

