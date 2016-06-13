var EventProxy = require('eventproxy');
var _ = require('lodash');

var Message = require('../models').Message;

var User = require('./user');
var Talk = require('./talk');


/**
 * 根据用户ID，获取未读消息的数量
 * Callback:
 * 回调函数参数列表：
 * - err, 数据库错误
 * - count, 未读消息数量
 * @param {String} id 用户ID
 * @param {Function} callback 获取消息数量
 */
exports.getMessagesCount = function (id, callback) {
  Message.count({master_id: id, has_read: false}, function(err, count){
    callback(err, count);
  });
};


exports.checkUpMessage = function(master_id, author_id, talk_id, callback){
  Message.find({master_id: master_id, author_id: author_id, talk_id:talk_id ,type: 'up'},callback);
};

/**
 * 根据消息Id获取消息
 * Callback:
 * - err, 数据库错误
 * - message, 消息对象
 * @param {String} id 消息ID
 * @param {Function} callback 回调函数
 */
exports.getMessageById = function (id, callback) {
  Message.findOne({_id: id}, function (err, message) {
    if (err) {
      return callback(err);
    }
    getMessageRelations(message, callback);
  });
};

var getMessageRelations = exports.getMessageRelations = function (message, callback) {
  if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at' || message.type === 'up' ||message.type ==='follow') {

    var proxy = new EventProxy();
    proxy.fail(callback);
    proxy.assign('author', 'talk', function (author, talk) {
      message.author = author;
      message.talk = talk;
      if (!author || (!talk && message.type !=='follow')) {
        message.is_invalid = true;
      }
      
      return callback(null, message);
    }); // 接收异常
    User.findById(message.author_id, proxy.done('author'));
    Talk.findById(message.talk_id, proxy.done('talk'));

  } else {
    return callback(null, {is_invalid: true});
  }
};

/**
 * 根据用户ID，获取已读消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getReadMessagesByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: true}, null,
    {sort: '-create_at', limit: 20}, callback);
};

/**
 * 根据用户ID，获取未读消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 未读消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUnreadMessageByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: false}, null,
    {sort: '-create_at'}, callback);
};


/**
 * 将消息设置成已读
 */
exports.updateMessagesToRead = function (userId, messages, callback) {
  callback = callback || _.noop;
  if (messages.length === 0) {
    return callback();
  }
console.log("true");
  var ids = messages.map(function (m) {
    return m.id;
  });

  var query = { master_id: userId, _id: { $in: ids } };
  Message.update(query, { $set: { has_read: true } }, { multi: true }).exec(callback);
};
