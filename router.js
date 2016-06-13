var express = require('express');
var sign = require('./controllers/sign');
var talk = require('./controllers/talk');
var user = require('./controllers/user');
var message = require('./controllers/message');
var upload = require('./controllers/upload');


var router = express.Router();

router.get('/',talk.index);

router.get('/reg', sign.checkNotLogin, sign.showSignup);
router.post('/reg', sign.checkNotLogin, sign.signup);
router.get('/login', sign.showLogin);
router.post('/login', sign.checkNotLogin, sign.login);
router.get('/logout', sign.logout);
router.get('/resetPass', sign.checkLogin, sign.resetPass);
router.post('/resetPass', sign.updatePass);
router.post('/follow/u/:name',sign.checkLogin,user.follow);
router.post('/post', sign.checkLogin, talk.post);
router.get('/upload', sign.checkLogin, upload.showUpload);
router.post('/upload', sign.checkLogin, upload.upload);

router.get('/search', user.search);
router.get('/u/:name', user.index);
router.get('/u/:name/talk', user.getUserTalk);
router.get('/my_t',sign.checkLogin, talk.showMys);
router.get('/t', talk.showAll);
router.get('/t/:_id/replys', talk.showReply);
router.get('/t/:_id', talk.getOneTalk);
router.post('/t/:_id', talk.reply);  //评论文章

router.get('/remove/t/:_id', sign.checkLogin, talk.remove);
router.get('/remove/t/:_id/:num', sign.checkLogin, talk.removeReply);

router.get('/archive', talk.archive);
router.get('/tags', talk.getTags);
router.get('/tags/:tag', talk.findByTag);
router.get('/reprint/t/:_id', sign.checkLogin, talk.showReprint);
router.post('/reprint/t/:_id', sign.checkLogin, talk.reprint);
router.post('/like/t/:_id',sign.checkLogin,talk.like );
router.post('/like/t/:_id/:num',sign.checkLogin,talk.up );

router.get('/message',sign.checkLogin , message.index );
router.post('/message/count',sign.checkLogin , message.count );

module.exports = router;

