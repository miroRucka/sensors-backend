var mongoose = require('mongoose');
module.exports.photosModel = mongoose.model('photos', mongoose.Schema({
    locationId: String,
    note: String,
    timestamp: {type: Date, default: Date.now},
    photo: {
        data: Buffer,
        contentType: String
    }
}));