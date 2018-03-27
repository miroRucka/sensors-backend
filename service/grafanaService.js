/**
 * Created by mito on 27. 3. 2018.
 */
var _ = require('lodash');

module.exports = function (data, temperatureKey) {
    return _.map(data, function (r) {
        var tempeartures = r.temperature;
        var temperature = _.find(tempeartures, function (o) {
            return o.key === temperatureKey;
        });
        var timestamp = new Date(r.timestamp);
        return [_.isEmpty(temperature) ? 0 : temperature.value, timestamp.getTime()]
    });
};

