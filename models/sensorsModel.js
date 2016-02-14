var mongoose = require('mongoose');
module.exports.sensorsModel = mongoose.model('sensors', mongoose.Schema({
    temperature: Number,
    humidity: Number,
    location: String,
    locationId: String,
    note: String,
    timestamp: {type: Date, default: Date.now}
}));