var models  = require('../models');
var utility        = require('utility');
var User    = models.User;


exports.createToSave = function (name, s_no, password, email, head, callback) {
  var user         = new User();
  user.name        = name;
  user.s_no        = s_no;
  user.password    = password;
  user.email       = email;
  user.head        = head;

  user.save(callback);
};
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
exports.findById = function(id, callback) {
  User.findById(id, function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};
exports.getUserByName = function( name, callback) {
  User.findOne({'name': name}, function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};
exports.getUsersByNames = function (names, callback) {
  if (names.length === 0) {
    return callback(null, []);
  }
  User.find({ name: { $in: names } }, callback);
};

exports.getUserByS_no = function(s_no, callback) {
  User.findOne({'s_no': s_no}, function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};
exports.getUserByEmail = function(email, callback) {
  User.findOne({'email': email}, function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};
exports.getUsersByQuery = function (query, opt, callback) {
  User.find(query, '', opt, callback);
};
var makeGravatar = function (email) {
  return 'http://www.gravatar.com/avatar/' + utility.md5(email.toLowerCase()) + '?size=48';
};
exports.makeGravatar = makeGravatar;

exports.getGravatar = function (user) {
  return user.avatar || makeGravatar(user);
};