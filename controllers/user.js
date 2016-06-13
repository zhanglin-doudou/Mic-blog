var User = require('../proxy/user');
var Talk = require('../proxy/talk');
var message    = require('../common/message');

exports.index = function(req, res, next){
  var c_user;
  if(req.session.user){
    c_user= req.session.user;
  }else{
    c_user='';
  }
    User.getUserByName(req.params.name,function(err, user){
      if (user && (c_user.name !== req.params.name)) {
        user.update({
          $inc: {"pv": 1}
        }, function (err) {
          if (err) {
            return callback(err);
          }
        });
      }
      Talk.getArchive(req.params.name,function(err, talks){
        if(!user){
          res.render('user/index',{
          title:"个人主页",
          user: c_user,
          s_user:c_user,
          talks:talks,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
         });
        }
        else{
         res.render('user/index',{
          title:"个人主页",
          s_user:user,
          user: c_user,
          talks:talks,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
         });
        }
      });
    });
};

exports.getUserTalk = function(req, res, next){
	var page = parseInt(req.query.p) || 1;
    //检查用户是否存在
    //User.get(req.params.name, function (err, user) {
    //  if (!user) {
      //  req.flash('error', '用户不存在!'); 
      //  return res.redirect('/');
     // }
      //查询并返回该用户第 page 页的 10 篇文章
    Talk.getTen(req.params.name, page, function (err, talks, total) {
        if (err) {
          req.flash('error', err); 
          return res.redirect('/');
        } 
        res.render('user/talk', {
          title: req.params.name,
          talks: talks,
          page: page,
          isFirstPage: (page - 1) === 0,
          isLastPage: ((page - 1) * 10 +talks.length) == total,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      //});
    }); 
};

exports.follow = function(req, res, next){
  var name = req.params.name;
  var userName = req.session.user.name;
  var u_Id = req.session.user._id;
  User.getUserByName(name, function (err, user) {
    User.getUserByName(userName, function(err, c_user){
      if (err) {
        return next(err);
      }
      if (name == userName) {
        res.send({
          message:"不能关注自己"
        });
      }
      else{
        var action;
        user.follower = user.follower || [];
        var followIndex = user.follower.indexOf(userName);
        var followingIndex = c_user.following.indexOf(name);
        if (followIndex === -1) {
          user.follower.push(userName);
          c_user.following.push(name);
          action = 'up';
        } else {
          user.follower.splice(followIndex, 1);
          c_user.following.splice(followingIndex, 1);
          action = 'down';
        }
        c_user.save();
        user.save();
        res.send({
          success: true,
          action: action
        });
        message.sendFollowMessage(user._id, c_user._id);
      }
    });
  });
};

exports.search = function(req, res, next) {
    User.search(req.query.keyword, function (err, users) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/t');
      }
      res.render('user/search', {
        title: "SEARCH:" + req.query.keyword,
        users: users,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
};
