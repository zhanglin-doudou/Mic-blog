


exports.showUpload = function(req, res, next){
	res.render('upload', {
    	title: '文件上传',
    	user: req.session.user,
    	success: req.flash('success').toString(),
    	error: req.flash('error').toString()
	});
};

exports.upload = function(req, res, next){
	req.flash('success', '文件上传成功!');
	res.redirect('/upload');
};