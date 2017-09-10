var stompUrl = 'horske.info';
var stompPort = '61613';
var user = 'admin';
var pass = 'Suslik123';

var Stomp = require('stomp-client');
var stompClient = new Stomp(stompUrl, stompPort, user, pass);
var logger = require('../config/logging');
/**
 * horske.info
 * stomp messaging service
 * @returns {{connect: _connect}}
 */
module.exports = function () {

    var _connect = function (connectionCb) {
        logger.info('connect to stomp connection url: ', stompUrl, stompPort, ' as user ', user);
        return stompClient.connect(function (sessionId) {
            connectionCb(sessionId, stompClient);
            stompClient.on("connect", function () {
                logger.info('client connect');
            });
            stompClient.on("reconnect", function () {
                logger.info('client reconnect');
            });
            stompClient.on("error", function (e) {
                logger.info('client error', e);
            });
            stompClient.on("reconnecting", function () {
                logger.info('reconnecting');
            });
        });
    };

    var _disconnect = function (cb) {
        logger.info('disconnect stomp messaging service');
        cb = cb || function () {
            };
        stompClient.disconnect(cb);
    };


    var _reconnect = function (connectionCb) {
        _disconnect();
        _connect(connectionCb);
    };

    return {
        connect: _connect,
        disconnect: _disconnect,
        reconnect: _reconnect
    }

};
