var User         = require('../proxy/user');
var Talk        = require('../proxy/talk');
var config       = require('../config');
var io = require('socket.io');

socketio.listen('127.0.0.1:3000').on('connection', function (client) {
    //监听成功
    client.on('message', function (msg) {
        console.log('Message Received: ', msg);
           client.send('message', msg);
    });
    client.on("disconnect", function() {
        console.log("Server has disconnected");
    });
});