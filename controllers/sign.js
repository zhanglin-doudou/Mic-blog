var validator      = require('validator');
var eventproxy     = require('eventproxy');
var tools          = require('../common/tools');
var crypto = require('crypto');   //我们用它生成散列值来加密密码
var User = require('../proxy/user');


returnHash = function(data) {  
    return crypto.createHash('md5').update(data).digest('hex');  
};  

exports.showSignup = function(req, res, next){
	res.render('sign/reg', {
   		title: '注册',
		user: req.session.user,
		success: req.flash('success').toString(),
    	error: req.flash('error').toString()
  	});
};
exports.signup = function(req, res, next){
  var name = validator.trim(req.body.name).toLowerCase();
  var s_no = validator.trim(req.body.sno);
  var email = validator.trim(req.body.email).toLowerCase();
  var password = req.body.password;
  var rePassword = req.body.passwordRepeat;

  var ep = new eventproxy();
  ep.fail(next);
  ep.on('prop_err', function (msg) {
    res.status(422);
    res.render('sign/reg', {
      title: 'err',
      user:'',
      success:'',
      error: msg,
      name: name,
      email: email
    });
  });

  // 验证信息的正确性
  if ([name, password, rePassword, email].some(function (item) { return item === ''; })) {
    ep.emit('prop_err', '信息不完整。');
    return;
  }
  if (password !== rePassword) {
    return ep.emit('prop_err', '两次密码输入不一致。');
  }
  // END 验证信息的正确性
  User.getUserByS_no(s_no,function(err, user){
    if (err) {
      return next(err);
    }
    if (user){
      ep.emit('prop_err','此学号已经注册过，请直接登录');
      return;
    }
    User.getUsersByQuery({'$or': [
      {'name': name},
      {'email': email}
    ]}, {}, function (err, users) {
      if (err) {
        return next(err);
      }
      if (users.length > 0) {
        ep.emit('prop_err', '用户名或邮箱已被使用。');
        return;
      }
        var head = User.makeGravatar(email);
        var password = returnHash(req.body.password);
        User.createToSave(name, s_no, password, email, head, function (err) {
          if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
          }
          req.flash('success', '注册成功');
          res.redirect('/');
        });
    });
  });


};

exports.showLogin = function(req, res, next){
	res.render('sign/login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
};

exports.login = function(req, res, next){
	var md5 = crypto.createHash('md5'),
    	password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
	User.getUserByS_no(req.body.sno, function (err, user) {
    	if (!user) {
    		req.flash('error', '学号错误或者不存在!'); 
    		return res.redirect('/login');//用户不存在则跳转到登录页
    	}
    //检查密码是否一致
    	if (user.password != password) {
    		req.flash('error', '密码错误!'); 
    		return res.redirect('/login');//密码错误则跳转到登录页
    	}
    //用户名密码都匹配后，将用户信息存入 session
    	req.session.user = user;
    	req.flash('success', '登陆成功!');
    	res.redirect('/');//登陆成功后跳转到主页
	});
};
exports.resetPass = function(req, res, next){
  res.render('sign/reset', {
        title: '修改密码',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
};

exports.updatePass = function(req, res, next){
  var re_password = returnHash(req.body.re_password),
      password = req.body.password,
      password_repeat = req.body.password_repeat;
  var _id = req.session.user._id;
  var ep = new eventproxy();
  ep.fail(next);
  ep.on('prop_err', function (msg) {
    res.status(422);
    res.render('sign/reset', {
      title: '修改密码',
      user:req.session.user,
      success:req.flash('success').toString(),
      error: msg
    });
  });
  if (password !== password_repeat) {
    return ep.emit('prop_err', '两次密码输入不一致。');
  }
  User.findById(_id, function(err, user){
    if (err){
      next(err);
    }
    if (user.password !== re_password){
      ep.emit('prop_err', '原来的密码错误，请重新输入');
      return;
    }
    var password = returnHash(req.body.password);
    user.update({$set :{password: password}},function(err){
      if (err){
        ep.emit('prop_err', '修改密码失败');
        return;
      }
      req.flash('success','修改成功,请重新登录');
      res.redirect('/logout');
    });
  });
};

exports.logout = function(req, res, next){
	req.session.user = null;
	req.flash('success', '登出成功!');
	res.redirect('/');//登出成功后跳转到主页
};

exports.checkLogin = function (req, res, next) {
	if (!req.session.user) {
   		req.flash('error', '未登录!'); 
   		return res.redirect('/login');
	}
	next();
};

exports.checkNotLogin = function (req, res, next) {
	if (req.session.user) {
   		req.flash('error', '已登录!'); 
   		return res.redirect('back');//返回之前的页面
	}
	next();
};