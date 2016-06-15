var models  = require('../models');
var utility = require('utility');
var Talk    = models.Talk;
var utility = require('utility');
var EventProxy = require('eventproxy');
var tools      = require('../common/tools');
var at         = require('../common/at');
var User       = require('./user');


exports.createToSave = function(author, create_time, tags, content,images, callback){
  var talk = new Talk();
  talk.content = content;
  talk.create_time = create_time;
  talk.images =images;
  talk.tags = tags;
  talk.author = author.name;
  talk.author_id = author._id;

  talk.save(callback);
};

exports.findById = function(id, callback){
  Talk.findById(id, function(err, talk){
    if(err)
      return callback(err);
    callback(err,talk);
  });
};
  //返回所有文章存档信息
exports.getArchive = function( userName, callback) {
      //返回只包含 name、time、title 属性的文档组成的存档数组
    var query = {};
    if(userName){
      query={author:userName};
    }
    Talk.find(query, {
        "author": 1,
        "create_time": 1,
        "content": 1,
        "reprint_info":1
    }).sort({
    	create_time: -1
    }).exec(function (err, docs) {
    	callback(null, docs);
    });
};
//一次获取十篇文章
exports.getTen = function(author, page, callback) {
    //使用 count 返回特定查询的文档数 total
    var start = (page - 1)*10,
      pageSize = 10;
    var query = {};
      if(author){
        Talk.find({author:{$in:author}}).skip(start).limit(pageSize).sort({create_time:-1}).exec(function(err,docs){
          if(docs){
            Talk.count({author:{$in:author}}, function(err , count){
              callback(null, docs, count); 
            });
          }else{
            callback(null, docs, 0); 
          }
        });  
      }
      else{
    	Talk.find(query).skip(start).limit(pageSize).sort({create_time:-1}).exec(function(err,docs){
          if(docs){
            Talk.count(query, function(err , count){
              callback(null, docs, count); 
            });
          }else{
            callback(null, docs, 0); 
          }
        //跳过前 (page-1)*10 个结果，返回之后的 10 个结果
    });
  }
};

//获取一篇文章
exports.getOneTalk = function (user, id, callback) {
	Talk.findOne({_id: id}, function(err, talk){
    if(err){
      return callback(err);
    }
    if (user && (user.name == talk.author)) {
      return callback(err, talk);
    }
          //每访问 1 次，pv 值增加 1
    else{
      talk.update({
        $inc: {"pv": 1}
      }, function (err) {
        if (err) {
          return callback(err);
        }
      });
    }
    callback(err, talk);
  });
};
  	//返回原始发表的内容（markdown 格式）
exports.remove = function(_id, callback) {
	//查询要删除的文档
    Talk.findOne({_id:_id}, function (err, doc) {
        //如果有 reprint_from，即该文章是转载来的，先保存下来 reprint_from
        var reprint_from = "";
        if (doc.reprint_info) {
          if (doc.reprint_info.reprint_from) {
          	reprint_from = doc.reprint_info.reprint_from;
          }
        }
        Talk.remove({_id:_id}, function (err) {
        	callback(null);
        });
    });
};
  //返回所有标签
exports.getTags = function(callback) {
	//distinct 用来找出给定键的所有不同值,避免了获取重复的标签
    Talk.distinct("tags", function (err, docs) {
        callback(null, docs);
    });
};
  //返回含有特定标签的所有文章
exports.getTag = function(tag, callback) {

    Talk.find({tags:tag},{
      "author": 1,
      "create_time": 1,
      "content": 1,
      "reprint_info":1
    }).sort({create_time:-1}).exec(function(err,docs){
        callback(null, docs);
    });
};
 	 //返回通过标题关键字查询的所有文章信息
exports.search = function(keyword, callback) {
    var pattern = new RegExp(keyword, "i");
    User.find({name: pattern}, {
        "name": 1,
        }).sort({
          create_time: -1
        }).exec(function (err, docs) {
          	callback(null, docs);
    });
  };

//转载一篇文章Post.reprint() 内实现了被转载的原文章的更新和转载后文章的存储。
exports.reprint = function(id, user, recomment, reprint_from, callback) {
	//找到被转载的文章的原文档
    Talk.findOne({_id:reprint_from.t_id}, function (err, doc) {
      if (err) {
        return callback(err);
      }
      var date = new Date();
      var reprint_info = {"recomment":recomment,"reprint_from": reprint_from};
      exports.createToSave(user,date, doc.tags, "", doc.images, function(err, talk){
        if(err){
          return callback(err);
        }
        Talk.update({
          _id:talk._id

        },{
            "reprint_info":reprint_info
          },function (err) {
            if (err){
              return callback(err);
            }
          });
        //更新被转载的原文档的 reprint_info 内的 reprint_to
        Talk.update({
        	_id:reprint_from.t_id
        }, {
          $push: {
            "reprint_info.reprint_to": {
              "t_id":talk._id,
              "author":user.name,
              "time": date
          }}
        },function (err) {
          if (err) {
            return callback(err);
          }
        });
        //更新被转载的reprint_info 内的 reprint_to
      if(reprint_from.t_id !=id){
        Talk.update({
          _id:id
        }, {
          $push: {
            "reprint_info.reprint_to": {
              "t_id":talk._id,
              "author":user.name,
              "time": time.date
          }}
        },function (err) {
          if (err) {
            return callback(err);
          }
        });
      }
      callback(err, talk);
    });
  });
};

exports.saveReply = function (content, talk_id, replyFrom, replyTo, ups, callback) {
  var date = new Date();
  var time = {
    date: date,
    year : date.getFullYear(),
    month : date.getFullYear() + "-" + (date.getMonth() + 1),
    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute :date.getFullYear() + "-" +(date.getMonth() + 1) + "-" + date.getDate() + " " + 
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
  var reply       = {
    reply_id: Number,
    content : content,
    content_is_html: false,
    talk_id: talk_id,
    replyFrom: replyFrom,
    replyTo:replyTo,
    create_at: time.minute,
    ups:ups
  };
  
    //把一条留言对象添加到该文档的 replys 数组里
  Talk.findById(talk_id, function(err, talk){
    if(!!talk.replys ){
      reply.reply_id = talk.replys.length;
    }else{
      reply.reply_id = 0;
    }
    talk.update({
      $push: {"replys": reply}
      } , function (err, talk) {
        if(err){
          return callback(err);
        }
      at.linkUsers(reply.content, function (err, str) {
        if (err) {
          return callback(err);
        }
        reply.content = str;
        return callback(err, reply);
      });

    });
    });  
};

exports.removeReply = function (talk_id, reply_id, callback) {
  Talk.findById(talk_id, function (err, talk) {
    talk.replys.splice(reply_id, 1);
    talk.save(function () {
    });
    callback(err);
  });

};
exports.upReply = function(res, talk_id, reply_id, userName, callback){
  Talk.findById(talk_id, function (err, talk) {
    if (err) {
      return callback(err);
    }
      var action;
      var likeIndex = talk.replys[reply_id].ups.indexOf(userName);
      if (likeIndex === -1) {
        talk.replys[reply_id].ups.push(userName);
        action = 'up';
      } else {
        talk.replys[reply_id].ups.splice(likeIndex, 1);
        action = 'down';
      }
      var replys = talk.replys;
      Talk.update({_id:talk_id},{
        "replys":replys
      },function (err, talk) {
        res.send({
          success: true,
          action: action
        });
      });
  });
};

exports.getReplyCount = function(talk_id, callback){
  Talk.aggregate().unwind("replys").match({_id:talk._id}).exec(function(err, docs){
    if (err) {
      return callback(err);
    }
    callback(err, docs.length);
  });
};
