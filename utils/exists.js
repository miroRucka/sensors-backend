/**
 * Created by mito on 27. 7. 2017.
 */
var _ = require('lodash');

module.exports = function (input) {
    return !_.isUndefined(input) && !_.isNull(input);
};