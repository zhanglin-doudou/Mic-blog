var validator = require('validator');
var at           = require('../common/at');
var User         = require('../proxy/user');
var Talk        = require('../proxy/talk');
var EventProxy   = require('eventproxy');
var tools        = require('../common/tools');
var message    = require('../common/message');
//var store        = require('../common/store');
var config       = require('../config');
var _            = require('lodash');
//var cache        = require('../common/cache');

exports.index = function(req, res, next){
  //判断是否是第一页，并把请求的页数转换成 number 类型
  var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
  Talk.getTen(null, page, function (err, talks, total) {
    if (err) {
      talks = [];
    } 
    res.render('home', {
      title: '首页',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
};
//发表说说
exports.post = function(req, res, next){
	var currentUser = req.session.user,
      content = req.body.content,
    	tags = [req.body.tag1, req.body.tag2, req.body.tag3];
  var images = [];
  var date = new Date();
	Talk.createToSave(currentUser, date, tags, content,images, function(err, talk){
    	if (err) {
    		req.flash('error', err); 
    		return res.redirect('/t');
    	} 
      var newContent = content.replace('@' + currentUser.name, '');
      at.sendMessageToMentionUsers(newContent, talk._id, currentUser._id);
    	req.flash('success', '发布成功!');
      res.send({success:"success"});
	});

};
//显示一条说说
exports.getOneTalk = function(req, res ,next){
	Talk.getOneTalk(req.session.user, req.params._id, function (err, talk) {
    	if (err) {
    		req.flash('error', err); 
    		return res.redirect('/t');
    	}
    	res.render('talk/article', {
    		title: talk.author,
    		talk: talk,
    		user: req.session.user,
    		success: req.flash('success').toString(),
    		error: req.flash('error').toString()
    	});
	});
};
//显示新鲜事广场页面
exports.showAll = function(req, res ,next){
 //判断是否是第一页，并把请求的页数转换成 number 类型
  var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
  Talk.getTen(null, page, function (err, talks, total) {
    if (err) {
      talks = [];
    } 
    res.render('talk/showAll', {
      title: '主页',
      talks: talks,
      page: page,
      isFirstPage: (page - 1) === 0,
      isLastPage: ((page - 1) * 10 + talks.length) == total,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
};
//显示我的新鲜事页面
exports.showMys = function(req, res ,next){
 //判断是否是第一页，并把请求的页数转换成 number 类型
  var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
  User.getUserByName(req.session.user.name,function(err,user){
  	user.following.push(req.session.user.name);
	  Talk.getTen(user.following, page, function (err, talks, total) {
	    if (err) {
	      talks = [];
	    } 
	    res.render('talk/showAll', {
	      title: '主页',
	      talks: talks,
	      page: page,
	      isFirstPage: (page - 1) === 0,
	      isLastPage: ((page - 1) * 10 + talks.length) == total,
	      user: req.session.user,
	      success: req.flash('success').toString(),
	      error: req.flash('error').toString()
	    });
	  });
  });
};


//删除说说
exports.remove = function(req, res, next){
	Talk.remove(req.params._id, function (err) {
   		if (err) {
      		req.flash('error', err); 
      		return res.redirect('back');
    	}
    	req.flash('success', '删除成功!');
    	res.redirect('/t');
  	});
};
//显示转载页面
exports.showReprint = function(req, res, next){
	Talk.findById(req.params._id, function (err, talk) {
        if (err) {
        	req.flash('error', err); 
        	return res.redirect('back');
        }

		res.render('talk/reprint',{
			title:'转发',
			talk:talk,
			user:req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
};
//转载
exports.reprint = function(req, res, next){
  var recomment, reprint_from;
  if (req.body.recomment){
    recomment = req.body.recomment;
  }
	Talk.findById(req.params._id, function (err, talk) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }

      if(talk.reprint_info.reprint_from){   //如果该talk是转载的就获取转载源，如果不是就创建转载源
        reprint_from = talk.reprint_info.reprint_from;
      }
      else{
        reprint_from = {t_id:req.params._id,author: talk.author,content:talk.content,time: talk.create_time};
      }
      var currentUser = req.session.user,
          reprint_to = {};
      Talk.reprint(req.params._id,currentUser,recomment, reprint_from, function (err) {
        if (err) {
          req.flash('error', err); 
          return res.redirect('back');
        }
        req.flash('success', '转发成功!');
        var url = encodeURI('/t');
        //跳转到转载后的文章页面
        res.redirect(url);
      });
    });
};
//找人
exports.search = function(req, res, next) {
    Talk.search(req.query.keyword, function (err, talks) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/t');
      }
      res.render('talk/search', {
        title: "SEARCH:" + req.query.keyword,
        talks: talks,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
};
//获取标签
exports.getTags = function(req, res, next) {
	Talk.getTags(function (err, talks) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/t');
      }
      res.render('talk/tags', {
        title: '标签',
        talks: talks,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  };
//通过标签查找说说
exports.findByTag = function(req, res, next) {
	Talk.getTag(req.params.tag, function (err, talks) {
      if (err) {
        req.flash('error',err); 
        return res.redirect('/t');
      }
      res.render('talk/tag', {
        title: 'TAG:' + req.params.tag,
        tag:req.params.tag,
        talks: talks,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
};

exports.archive = function(req, res, next){
	Talk.getArchive('',function (err, talks) {
   		if (err) {
   			req.flash('error', err); 
   			return res.redirect('/t');
   		}
   		res.render('talk/archive', {
	   		title: '存档',
   			talks: talks,
      		user: req.session.user,
      		success: req.flash('success').toString(),
      		error: req.flash('error').toString()
    	});
  	});
};
//评论回复
exports.reply = function(req, res, next){
  var content = req.body.content,
      talk_id = req.params._id,
      replyFrom = req.session.user.name;
  var reply_id = req.body.num;

  var str = validator.trim(String(content));
  if (str === '') {
    return res.renderError('回复内容不能为空!', 422);
  }

  var ep = EventProxy.create();
  ep.fail(next);

  Talk.findById(talk_id, ep.doneLater(function (talk) {
    if (!talk) {
      ep.unbind();
      // just 404 page
      return next();
    }
    ep.emit('talk', talk);
  }));

  ep.all('talk', function (talk) {
    User.getUserByName(talk.author, ep.done('talk_author'));
  });

  ep.all('talk', 'talk_author', function (talk, talkAuthor) {
    Talk.saveReply(content, talk_id, replyFrom, null, [], ep.done(function (reply) {
        ep.emit('reply_saved', reply);
        //发送at消息，并防止重复 at 作者
        var newContent = content.replace('@' + talkAuthor.name, '');
        at.sendMessageToMentionUsers(newContent, talk_id, req.session.user._id, reply.reply_id);
    }));
  });

  ep.all('reply_saved', 'talk','talk_author', function (reply, talk, talkAuthor) {
    if (talkAuthor.name.toString() !== req.session.user.name.toString()) {
      message.sendReplyMessage( talkAuthor._id, req.session.user._id, talk._id, reply.reply_id);
    }
    ep.emit('message_saved');
  });

  ep.all('reply_saved', 'message_saved', function (reply) {
    res.redirect('/t/' + talk_id);
  });
};
//获取评论
exports.showReply = function(req, res, next){
  Talk.findById(req.params._id, function(err, talk){
    if(err){
      req.flash("error","获取评论失败");
      return res.redirect('/t');
    }
    req.flash("success","获取评论成功");
    res.render('talk/replys',{
          title: "评论",
          replys: talk.replys,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
    });
  });
};
exports.removeReply = function(req, res, next){
  var talkId = req.params._id;
  var replyId = req.params.num;
  Talk.removeReply(talkId, replyId, function(err,talk){
    req.flash("success","删除评论成功");
    res.redirect('back');
  });
};
//评论点赞
exports.up = function (req, res, next) {
  var talkId = req.params._id;
  var replyId = req.params.num;
  var c_user = req.session.user;
  var u_Id = req.session.user._id;
  Talk.upReply(res ,talkId, replyId, c_user.name);
  };
//说说点赞
exports.like = function (req, res, next) {
  var talkId = req.params._id;
  var c_user = req.session.user;
  var u_Id = req.session.user._id;
  Talk.findById(talkId, function (err, talk) {
    if (err) {
      return next(err);
    }
	  var action;
	  talk.likes = talk.likes || [];
	  var likeIndex = talk.likes.indexOf(c_user.name);
	  if (likeIndex === -1) {
	    talk.likes.push(c_user.name);
      if(talk.author_id!=c_user._id){
        message.sendUpMessage(talk.author_id, c_user._id, talk._id);
      }
	    action = 'up';
	  } else {
	    talk.likes.splice(likeIndex, 1);
	    action = 'down';
	  }
	  talk.save();
    res.send({
      success: true,
      action: action
    });
  });
};