var path = require('path');

var config = { 
	// debug 为 true 时，用于本地调试
	debug: true,
 	cookieSecret: 'myblog', 
	db: 'mongodb://127.0.0.1/blog', 
	host: '127.0.0.1',
	port: 3000,
	mongodb_port: 27017,
	mongodb_db:'blog'


};

module.exports = config;