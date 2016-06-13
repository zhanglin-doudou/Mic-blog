var models       = require('../models');
var eventproxy   = require('eventproxy');
var Message      = models.Message;
var Talk         = require('../proxy/talk');
var User         = require('../proxy/user');
var messageProxy = require('../proxy/message');
var _            = require('lodash');

exports.sendReplyMessage = function (master_id, author_id, talk_id, reply_id, callback) {
  callback = callback || _.noop;
  var ep = new eventproxy();
  ep.fail(callback);

  var message       = new Message();
  message.type      = 'reply';
  message.master_id = master_id;
  message.author_id = author_id;
  message.talk_id   = talk_id;
  message.reply_id  = reply_id;
  //message.content   = content;

  message.save(ep.done('message_saved'));
  ep.all('message_saved', function (msg) {
   	callback(null, msg);
  });
};

exports.sendReply2Message = function ( master_id, author_id, talk_id, reply_id, callback) {
  callback = callback || _.noop;
  var ep = new eventproxy();
  ep.fail(callback);

  var message       = new Message();
  message.type      = 'reply2';
  message.master_id = master_id;
  message.author_id = author_id;
  message.talk_id   = talk_id;
  message.reply_id  = reply_id;
  //message.content   = content;

  message.save(ep.done('message_saved'));
  ep.all('message_saved', function (msg) {
   	callback(null, msg);
  });
};

exports.sendAtMessage = function (master_id, author_id, talk_id,  callback) {
  callback = callback || _.noop;
  var ep = new eventproxy();
  ep.fail(callback);
  var message       = new Message();
  message.type      = 'at';
  message.master_id = master_id;
  message.author_id = author_id;
  message.talk_id   = talk_id;
  // message.content   = content;

  message.save(ep.done('message_saved'));
  ep.all('message_saved', function (msg) {
    callback(null, msg);
  });
};

exports.sendUpMessage = function (master_id, author_id, talk_id, callback) {
  callback = callback || _.noop;
  messageProxy.checkUpMessage(master_id, author_id, talk_id, function(err, msg){
  	if(msg && msg.length >0)
  		return callback(null, msg);
    var ep = new eventproxy();
    ep.fail(callback);
    var message       = new Message();
  	message.type      = 'up';
  	message.master_id = master_id;
  	message.author_id = author_id;
  	message.talk_id   = talk_id;
  	// message.content   = content;
  	//更新说说的pv统计
  	Talk.findById(talk_id, function(err, talk){
  		talk.update({
          $inc: {"pv": 1}
        }, function (err) {
          if (err) {
            return callback(err);
          }
        });
  	});

  	message.save(ep.done('message_saved'));
  	ep.all('message_saved', function (msg) {
    	callback(null, msg);
  	});
  });

};

exports.sendFollowMessage = function (master_id, author_id, callback) {
  callback = callback || _.noop;
  var ep = new eventproxy();
  ep.fail(callback);
  var message       = new Message();
  message.type      = 'follow';
  message.master_id = master_id;
  message.author_id = author_id;

  message.save(ep.done('message_saved'));
  ep.all('message_saved', function (msg) {
    callback(null, msg);
  });
};
