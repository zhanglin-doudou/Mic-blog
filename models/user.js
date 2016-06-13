var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var BaseModel = require("./base_model");
var ObjectId  = Schema.ObjectId;
var UserSchema = new mongoose.Schema({
  name:{ type : String},
  s_no:{ type : String},
  password: { type : String},
  email: { type : String},
  head: { type : String},
  follower:[],
  following:[],
  topic_count: { type: Number, default: 0 },

  weibo: { type: String },
  avatar: { type: String },
  githubId: { type: String},
  githubUsername: {type: String},
  githubAccessToken: {type: String},
  is_block: {type: Boolean, default: false},

  score: { type: Number, default: 0 },
  create_time: { type: Date, default: Date.now },
  is_star: { type: Boolean },
  level: { type: String },
  accessToken: {type: String},
  pv:{type: Number, default:0},


});

UserSchema.plugin(BaseModel);
UserSchema.index({name: 1}, {unique: true});  //数据库的索引
UserSchema.index({email: 1}, {unique: true});


mongoose.model('User', UserSchema); //变小写就是集合的名字