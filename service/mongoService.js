/**
 * horske.info
 * database service
 * @returns {{connect: _connect}}
 */
module.exports.service = function service(mongoose) {

    var _isDev = function () {
        return true;
    };

    var _getMongoConfig = function () {
        if (process.env.VCAP_SERVICES) {
            var env = JSON.parse(process.env.VCAP_SERVICES);
            return env['mongodb-1.8'][0]['credentials'];
        }
        return {
            "hostname": _isDev() ? "virtual" : "localhost",
            "port": _isDev() ? 44 : 27017,
            "username": "admin",
            "password": "DT3EK93t",
            "name": "",
            "db": "sensors"
        }
    };


    var _mongoUrl = function () {
        var obj = _getMongoConfig();
        obj.hostname = (obj.hostname || 'localhost');
        obj.port = (obj.port || 27017);
        obj.db = (obj.db || 'test');
        if (obj.username && obj.password) {
            return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
        }
        else {
            return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
        }
    };

    var _connect = function () {
        return mongoose.connect(_mongoUrl());
    };

    var _disconnect = function (cb) {
        cb = cb || function () {
            };
        mongoose.connection.close(function () {
            cb();
        });
    };

    return {
        connect: _connect,
        disconnect: _disconnect
    }

};