jQuery(document).ready(function($){
    $.post('/message/count', function (data) {
      if (data.status === 'success' && data.count > 0) {
      	$('.message-count').text(data.count);
      }else{
      	$('.message-count').text();
      }
    }, 'json');
    //消息界面的选项卡
    $('#old-message').hide();
    $('#new-message-btn').click(function(){
    	$('#new-message-btn').css({'color':'#fff','background-color':'#00bbbb'});
    	$('#old-message-btn').css({'color':'#000','background-color':'#f2f2f2'});
    	$('#new-message').show();
    	$('#old-message').hide();

    });
    $('#old-message-btn').click(function(){
    	$('#old-message-btn').css({'color':'#fff','background-color':'#00bbbb'});
    	$('#new-message-btn').css({'color':'#000','background-color':'#f2f2f2'});
    	$('#new-message').hide();
    	$('#old-message').show();
    });

	//open navigation clicking the menu icon
	$('.cd-nav-trigger').on('click', function(event){
		event.preventDefault();
		toggleNav(true);
	});
	//close the navigation
	$('.cd-close-nav, .cd-overlay').on('click', function(event){
		event.preventDefault();
		toggleNav(false);
	});


	function toggleNav(bool) {
		$('.cd-nav-container, .cd-overlay').toggleClass('is-visible', bool);
		$('main').toggleClass('scale-down', bool);
		$('body').toggleClass('no-scoll', bool);
	}

	/**** 表单验证****/
	var flag1, flag2, flag3, flag4, flag5 = false;
	$('#username').blur(function(){
		var username_notify = $('#username-notify');
		var name = $(this).val();
		if(name.length ===0){
			username_notify.html('<i class="icon-remove"></i>');
			inputError(username_notify);
			return;
		}
		if(name.length>0 && name.length<4){
			username_notify.html("用户名小于4个字符");
			inputError(username_notify);
			return;
		}
		if(name.length>16){
			username_notify.html("用户名大于16个字符");
			inputError(username_notify);
			return;
		}
		if(isChinaOrNumbOrLet(name)){
			if(isNumber(name)){
				username_notify.html("用户名不能为纯数字");
				inputError(username_notify);
			}
			else{
				inputSuccess(username_notify);
				flag1 = true;
			}
		}else{
			username_notify.html("用户名格式不正确");
			inputError(username_notify);
		}
	});
	$('#email').blur(function(){
		var email = $(this).val();
		var email_notify = $('#email-notify');
		if(email.length ===0){
			email_notify.html('<i class="icon-remove"></i>');
			inputError(email_notify);
			return;
		}
		if(isEmail(email)){
			inputSuccess(email_notify);
			flag2 = true;
		}else{
			email_notify.html("邮箱格式不正确");
			inputError(email_notify);
		}
	});
	$('#sno').blur(function(){
		var sno = $(this).val();
		var sno_notify = $('#sno-notify');
		if(sno.length ===0){
			sno_notify.html('<i class="icon-remove"></i>');
			inputError(sno_notify);
			return;
		}
		if(isNumber(sno)){
			inputSuccess(sno_notify);
			flag3 = true;
		}else{
			sno_notify.html("学号格式不正确");
			inputError(sno_notify);
		}
	});
	$('#password').blur(function(){
		var password = $(this).val();
		var password_notify = $('#password-notify');
		if(password.length ===0){
			password_notify.html('<i class="icon-remove"></i>');
			inputError(password_notify);
			return;
		}
		if(password.length>0 && password.length<6){
			password_notify.html("密码小于6位数");
			inputError(password_notify);
			return;
		}
		if(password.length>16){
			password_notify.html("密码大于16位数");
			inputError(password_notify);
			return;
		}
		inputSuccess(password_notify);
		flag4= true;
	});
	$('#password-repeat').blur(function(){
		var password_repeat_notify = $('#password-repeat-notify');
		if($(this).val().length ===0){
			password_repeat_notify.html('<i class="icon-remove"></i>');
			inputError(password_repeat_notify);
			return;
		}
		if($(this).val() !== $('#password').val()){
			password_repeat_notify.html("两次输入的密码不一致");
			inputError(password_repeat_notify);
		}else{
			inputSuccess(password_repeat_notify);
			flag5 = true;
		}
	});
	function isChinaOrNumbOrLet( s ){//判断是否是汉字、字母、数字组成 
		var regu = "^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$";   
		var re = new RegExp(regu); 
		if (re.test(s)) { 
			return true; 
		}else{ 
			return false; 
		} 
	}
	function isNumber( s ){    //判断是否为数字
		var regu = "^[0-9]+$"; 
		var re = new RegExp(regu); 
		if (s.search(re) != -1) { 
			return true; 
		} else { 
			return false; 
		} 
	}
	function isEmail( s ){  //判断是否为Email
		var myReg = /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/; 
		if(myReg.test(s)) return true; 
			return false; 
	}
	function inputError(s){
		s.parent().css({'background-color':'#f2dede','color':'#a94442','border-color':'#ebccd1'});
	}
	function inputSuccess(s){
		s.html('<i class="icon-ok"></i>');
		s.parent().css({'background-color':'#dff0d8','color':'#3c763d','border-color':'#d6e9c6'});
	}
	
    $('#register').click(function(){
        if(flag1 && flag2 && flag3 && flag4 && flag5){
            $('form').submit();
        }else{
            $('form').focus();
            alert("填写有误！请确认");
            return false;
        }
    });

	$('.btn-group').click(function(){
		$('.dropdown-menu').toggle();
	});
	$('.dropdown-btn').click(function(){
		$(this).next().toggle();
	});
	$('.like-btn').click(function (e) {
	    var $this = $(this);
	    var talkId = $this.attr('talkId');
	    $.ajax({
	      url: '/like/t/' + talkId,
	      method: 'POST',
	    }).done(function (data) {
	      if (data.success) {
	        var currentCount = Number($this.find('.like-count').text().trim()) || 0;
	        if (data.action === 'up') {
	          $this.find('.like-count').text(currentCount + 1);
	          $this.children().first().removeClass('icon-heart-empty');
	          $this.children().first().addClass('icon-heart uped');
	        } else {
	          if (data.action === 'down') {
	            $this.find('.like-count').text(currentCount - 1);
	            $this.children().first().removeClass('icon-heart uped');
	            $this.children().first().addClass('icon-heart-empty');
	          }
	        }
	      } else {
	        alert('请先登录，登陆后即可点赞。');
	      }
	    }).fail(function (xhr) {
	      if (xhr.status === 403) {
	        alert('请先登录，登陆后即可点赞。');
	      }
	    });
	});
	$('#send-btn').click(function (e) {
	  var content = $('#content').val();
	  if(!content){
	  	alert("请输入内容");
	  	return;
	  }
	  var tag = $('#tag').val();
	  var data={'content':content,'tag1':tag};
	  $.ajax({
	      url: '/post',
	      method: 'POST',
	      data:data
	    }).done(function (data) {
	      if (data.success) {
	        window.location.reload();
	      } else {
	        alert(data);
	      }
	    }).fail(function (xhr) {
	      if (xhr.status === 403) {
	        alert('请先登录！');
	      }
	    });
	});
});