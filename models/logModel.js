var mongoose = require('mongoose');
module.exports.logModel = mongoose.model('log', mongoose.Schema({
    log: String,
    timestamp: {type: Date, default: Date.now}
}));