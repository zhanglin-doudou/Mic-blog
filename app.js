var express = require('express');
var Loader = require('loader');
var assets = {};
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var router = require('./router');
var config = require('./config');
var flash = require('connect-flash');
//var proxyMiddleware = require('./middlewares/proxy');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var app = express();

//使用 express-session 和 connect-mongo 模块实现了将会化信息存储到mongodb中。
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(session({
  secret: config.cookieSecret,
  key: config.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: config.mongodb_db,
    host: config.host,
    port: config.mongodb_port
  })
}));

_.extend(app.locals, {
  config: config,
  Loader: Loader,
  assets: assets
});
_.extend(app.locals, require('./common/render_helper'));

//增加图片上传功能
//dest 是上传的文件所在的目录，rename 函数用来修改上传后的文件名，这里设置为保持原来的文件名。
var multer  = require('multer');

app.use(multer({
  dest: './public/images',
  rename: function (fieldname, filename) {
    return filename;
  }
}));
app.enable('trust proxy');
// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views')); //设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方
app.set('view engine', 'ejs'); //设置视图模板引擎为 ejs。
app.use(flash()); //flash 是一个在 session 中用于存储信息的特定区域。信息写入 flash ，下一次显示完毕后即被清除。
//app.use('/agent', proxyMiddleware.proxy);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); //设置/public/favicon.ico为favicon图标
app.use(logger('dev'));  //加载日志中间件。
app.use(logger({stream: accessLog}));//添加输出日志
app.use(bodyParser.json());  //加载解析json的中间件。
app.use(bodyParser.urlencoded({ extended: false })); //加载解析urlencoded请求体的中间件。
app.use(cookieParser());  //加载解析cookie的中间件。
app.use(express.static(path.join(__dirname, 'public'))); //设置public文件夹为存放静态文件的目录。
app.use(function (err, req, res, next) {   //定义中间件来记录错误日志
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});


app.use('/',router);

app.listen(app.get('port'),function(){
	console.log('Express server lisening on port' + app.get('port'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
//开发环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中。
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500); 
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
//生产环境下的错误处理器，不会将错误信息泄露给用户。
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
