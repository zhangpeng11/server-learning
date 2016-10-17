/**
native_passport
验证码的请求逻辑见wiki地址：http://wiki.tuan800-inc.com/pages/viewpage.action?pageId=5725351
客户端交流协议见wiki地址：http://wiki.tuan800-inc.com/pages/viewpage.action?pageId=2636202
找回密码等页面url见wiki地址：http://wiki.tuan800-inc.com/pages/viewpage.action?pageId=5731111
**/
define(function(require,exports,module){
	var $ = require("zepto");
	require("../common/base");
	require("../common/callnative");
	var track = require("../common/track_v2"),
		dialog = require("../common/dialog"),
		mydialog = new dialog();
	/**
	验证码对象：包含请求验证码的所有函数
	验证码的请求逻辑见wiki地址：http://wiki.tuan800-inc.com/pages/viewpage.action?pageId=5725351
	**/
	var Captcha = {
		/**
		添加区分source_type的函数
		客户端变h5中登录source_type：MWagZT
					注册sourcetype：5I0qBx
		其中登录只有账号登录，没有手机验证码登录			
		**/
		getSourceType:function(type){
			if(type == "account_login"){
				var source_type = "MWagZT";
			}else if(type == "register"){
				var source_type = "5I0qBx";
			}else if(type == "findPwd"){
				var source_type = "b7qIcX";
			}
			return source_type;
		},
		/**
		method:进入登录页面后请求是否需要验证码
		param:{string} source_type的映射
		**/
		isNeedCaptch:function(type){
			$.ajax({
				type:"get",
				url:"https://passport.zhe800.com/j/h5/isNeedCaptcha",
				dataType:"jsonp",
				jsonp:"callback",
				success:function(data){
					if(data.isNeedCaptcha){
						//如果需要验证码，动态添加验证码输入框
						Captcha.getImageCaptcha(type);
					}
				},
				timeout:2000,
				error:function(){
					$.zheui.toast("网络异常，请稍后再试.");
				}
			});
		},
		/**
		method:获取图片验证码，并按照输入框的形式展示
		param:{string} source_type的映射	
		**/
		getImageCaptcha:function(key){
			/**
			登录不需要避免短信漏洞，所以business_code采用16位随机数	
			**/
			$(".btnSubmit").addClass("disable");
			var source_type = Captcha.getSourceType(key),
				businesscode = Math.random().toString(10).substr(2,16),
				validate_type = 2,
				step = 1;
			$.ajax({
				type:"get",
				url:"http://acode.zhe800.com/t/verify/get_token",
				dataType:"jsonp",
				jsonp:"callback",
				data:{
					"source_type":source_type,
					"business_code":businesscode,
					"validate_type":validate_type,
					"step":step
				},
				success:function(data){
					if(data.status == 1){
						if(data.validate_type == 2){
							if(data.validate_token != "" && data.validate_adds.image_url != ""){
								//动态添加验证码输入框
								if($("#captcha").length == 0){
									$(".login").find("p").eq(2).after("<p class='login_input login_input_name'><input id='captcha' name='captcha' style='width:50%' placeholder='验证码(点击图片刷新)' type='text' msg='验证码不能为空' reg='(^\s*)|(\s*$)' adjust='false' onKeypress='javascript:if(event.keyCode == 32)event.returnValue = false;''><button type='button' class='clearInput hide close_authcode'></button><img class='fr e_change_captcha_normal' src='" + data.validate_adds.image_url + "'></p>");
									$(".login").append("<p><input type='hidden' id='businesscode' value='" + businesscode + "'></p>");
									$(".login").append("<p><input type='hidden' id='validate_token' value='" + data.validate_token + "'></p>");
								}

								$(document).on("keyup","#captcha",function(){
									var value = $(this).val().replace(/\s+/g,'');
									$(this).val(value);
								});
								//换一张验证码
								$.zheui.bindTouchGoto($(".e_change_captcha_normal"),function(_this){
									Captcha.changeCaptcha(key,$(".e_change_captcha_normal"));
								});
								//验证码清除按钮点击事件
								$.zheui.bindTouchGoto($("#captcha").next(".clearInput"),function(_this){
									_this.prev("input").val("");
									var ele = _this.prev("input");
									ele.trigger("keyup");
								});
							}
						}
					}else{
						$.zheui.toast(data.msg.error_content);
					}
				},
				error:function(){
					$.zheui.toast("网络异常，请稍后再试.");
				}
			});
		},
		/**
		两级验证中第一级：获取图片验证码，并按弹出框的形式展示
		param:{string} source_type的映射
		param:{number} 第二级验证的类型
		**/
		getImageCaptchaDialog:function(key,next_validate_type){
			//存在短信漏洞，businesscode不可以使用随机数
			var source_type = Captcha.getSourceType(key),
				businesscode = "",
				validate_type = 2,
				step = 1;
			//跟passport商定注册的businesscode采用phone_number的形式	
			if(key == "register"){
				businesscode = $("#phone_number").val();
			}else if(key == "findPwd"){
				businesscode = $("#phone_number").val();
			}
			$.ajax({
				type:"get",
				url:"http://acode.zhe800.com/t/verify/get_token",
				dataType:"jsonp",
				jsonp:"callback",
				data:{
					"source_type":source_type,
					"business_code":businesscode,
					"validate_type":validate_type,
					"step":step
				},
				success:function(data){
					if(data.status == 1){
						if(data.validate_type == 2){
							if(data.validate_token != "" && data.validate_adds.image_url != ""){
								//动态生成弹框，并将图片的businesscode和token存起来
								var htmlStr = "<div class='login pop_captcha' style='margin:0;padding:0;display:inline'>";
								htmlStr += "<button type='button' class='pos_r captcha_close' id='btn_close'></button>";
								htmlStr += "<p class='pos_r captcha_area captcha_title'>为保证安全，请先提交图片验证码</p><p class='login_input login_input_name pos_r captcha_area' style='border:none;'><input id='captcha' name='captcha' placeholder='图片验证码' type='text' msg='验证码不能为空' reg='(^\s*)|(\s*$)' style='width:50%;border:solid 1px #d5d5d5;border-radius:3px' onkeypress='javascript:if(event.keyCode == 32)event.returnValue = false;'><img id='e_change_captcha_normal' class='fr' src='"+data.validate_adds.image_url+"'></p><p class='pos_r djtphyz' style='color:#9d9d9d;font-size:9px;text-align:right;margin:0 3%;border-top:none;border-bottom:none;'>点击图片刷新</p><p class='pos_r captcha_area captcha_button'><button id='confirm_security_button'>提交</button></p>";
								htmlStr += "<p class='captcha_area'><input type='hidden' id='validate_token' name='validate_token' value='"+data.validate_token+"'></p>";
								htmlStr += "<p class='captcha_area'><input type='hidden' id='businesscode' name='businesscode' value='"+businesscode+"'></p>";
								htmlStr += "<div>";
								mydialog.create("2",htmlStr);

								$(document).on("keyup","#captcha",function(){
									var value = $(this).val().replace(/\s+/g,'');
									$(this).val(value);
								});
								//关闭弹框按钮，点击事件
								$.zheui.bindTouchGoto($(".pop_captcha").find("#btn_close"),function(_this){
									mydialog.hide();
								});
								//换一张验证码
								$.zheui.bindTouchGoto($(".pop_captcha").find("#e_change_captcha_normal"),function(_this){
									Captcha.changeCaptcha(key,_this);
								});
								//提交验证码
								$.zheui.bindTouchGoto($(".pop_captcha").find("#confirm_security_button"),function(_this){
									if($("#captcha").val() === ""){
										$.zheui.toast("请输入图片验证码");
									}else{
										_this.text("提交中...");
										document.activeElement.blur();
										Captcha.checkImageCaptcha(key,$(".pop_captcha"),next_validate_type);
									}
								});
							}
						}
					}else{
						$.zheui.toast(data.msg.error_content);
					}
				},
				error:function(){
					$.zheui.toast("网络异常，请稍后再试.");
				}
			});
		},
		/**
		method:验证一级图片验证码
		param:{string} source_type的映射
		param:{domNode} 图片验证码的dom节点
		param:{number} 下一级验证类型
 		**/
		checkImageCaptcha:function(key,ele,next_validate_type){
			var businesscode = $("#businesscode").val(),
				validate_token = $("#validate_token").val(),
				content = ele.find("#captcha").val(),
				phone_number = $("#phone_number").val(),
				step = 1;
			$.ajax({
				type:"get",
				url:"http://acode.zhe800.com/t/verify/do_validate",
				dataType:"jsonp",
				jsonp:"callback",
				data:{
					"business_code":businesscode,
					"validate_token":validate_token,
					"content":content,
					"step":step
				},
				success:function(data){
					if(data.status == 1){
						//验证通过后，隐藏弹框，并进行二级验证
						mydialog.hide();
						Captcha.getNextCaptcha(key,next_validate_type,phone_number);
					}else if(data.status == 0){
						ele.find("#confirm_security_button").text("提交");
						$.zheui.toast("验证码输入错误");
						Captcha.changeCaptcha(key,ele.find("#e_change_captcha_normal"));
					}
				},
				error:function(){
					$.zheui.toast("网络异常，请稍后再试.");
				}
			});
		},
		/**
		method:修改图片验证码
		param:{string} source_type的映射
		param:{domNode} 图片验证码的dom节点
		**/
		changeCaptcha:function(key,ele){
			var source_type = Captcha.getSourceType(key),
				businesscode = $("#businesscode").val(),
				validate_token = $("#validate_token").val(),
				validate_type = 2,
				step = 1;
			$.ajax({
				type:"get",
				url:"http://acode.zhe800.com/t/verify/get_token",
				dataType:"jsonp",
				jsonp:"callback",
				data:{
					"source_type":source_type,
					"business_code":businesscode,
					"validate_type":validate_type,
					"step":step
				},
				success:function(data){
					if(data.status == 1){
						if(data.validate_type == 2){
							if(data.validate_token != "" && data.validate_adds.image_url != ""){
								//获取成功后。替换图片src和token
								ele.attr("src",data.validate_adds.image_url);
								$("#validate_token").val(data.validate_token);
							}
						}
					}else{
						$.zheui.toast(data.msg.error_content);
					}
				},
				error:function(){
					$.zheui.toast("网络异常，请稍后再试.");
				}
			});
		},
		/**
		@method 获取下一级验证码
		param：{string} source_type的映射
		param: {number} 下一级验证类型
		param：{string} 手机号
		**/
		getNextCaptcha:function(key,validate_type,phone_number){
			//因为存在手机号修改，所以businesscode需要根据手机号生成
			var source_type = Captcha.getSourceType(key),
				businesscode = "",
				validate_token = $("#validate_token").val(),
				validate_type = validate_type,
				step = 2,
				phone_number = phone_number,
				business_params = {phone_number:phone_number};
			if(key == "register"){
				businesscode = phone_number;
			}else if(key == "findPwd"){
				businesscode = phone_number;
			}
			$("#businesscode").val(businesscode);
			$.ajax({
				type:"get",
				url:"http://acode.zhe800.com/t/verify/get_token",
				dataType:"jsonp",
				jsonp:"callback",
				data:{
					"source_type":source_type,
					"business_code":businesscode,
					"validate_token":validate_token,
					"validate_type":validate_type,
					"step":step,
					"phone_number":phone_number,
					"business_params":JSON.stringify(business_params)
				},
				success:function(data){
					if(data.status == 1){
						if(data.validate_type == validate_type){
							if(data.validate_token != ""){
								$.zheui.toast("验证码发送成功");
								//验证码发送成功，把返回的token存起来
								if($("#token").length == 0){
									$("body").append("<p class='captcha_area'><input type='hidden' id='token' name='token' value='"+data.validate_token+"'></p>");
								}else{
									$("#token").val(data.validate_token);
								}
								//倒计时
								if(validate_type === 4){
									msgCountDown(60);
								}else if(validate_type === 5){
									voiceCountDown(60);
								}
							}
						}
					}else if(data.status == 0 && (data.failure_code == 1 || data.failure_code == 2 || data.failure_code == 4 || data.failure_code == 16)){
						//验证没通过，需要弹出图片验证码的情况
						//failure_code：1验证不存在
						//failure_code：2验证过期或非法
						//failure_code：4未完成上级验证
						//failure_code：16手机号不一样
						Captcha.getImageCaptchaDialog(key,validate_type);
					}else{
						$.zheui.toast(data.msg.error_content);
					}
				},
				error:function(){
					$.zheui.toast("网络异常，请稍后再试.");
				}
			});
		}

	};
	//method 短信验证码倒计时
	function msgCountDown(num){
		var num = num;
        var obj = $("#getCaptcha");
        obj.addClass("isCountDown");
        var CountDowning = function() {
            if (num >= 0) {
                obj.html(num + "s");
                --num;
            } else {
                clearInterval(timer);
                obj.html("获取验证码");
                obj.removeClass("isCountDown");
            }
        }
        var timer = setInterval(CountDowning, 1000);
        CountDowning();
	}
	//method  语音验证码倒计时
	function voiceCountDown(num){
		var num = num;
        var obj = $("#voiceCaptcha");
        obj.addClass("isCountDown").removeClass("enable").addClass("disable");
        var CountDowning = function() {
            if (num >= 0) {
                obj.html("语音验证码(" + num + "s)");
                --num;
            } else {
                clearInterval(timer);
                obj.html("获取验证码");
                obj.removeClass("isCountDown").removeClass("disable").addClass("enable");
            }
        }
        var timer = setInterval(CountDowning, 1000);
        CountDowning();
	}
	//绑定基本的事件
	function bindEvent(){
		//keyup 处理输入框尾部图标显示隐藏
		$(document).on("keyup",".login_input input",function(){
			if($(this).val() != ""){
				$(this).next(".clearInput").removeClass("hide");
			}else{
				if($(this).attr("id") == "password"){
					$(this).parents('p').next('.tip').addClass('hide');
				}
				$(this).next(".clearInput").addClass("hide");
			}
		});
		//blur 处理输入框尾部图标的隐藏
		$(document).on("blur",".login_input input",function(){
			$(this).next(".clearInput").addClass("hide");
			if($(this).attr("id")=="password"){
				$(this).parents('p').next('.tip').addClass('hide');
				$(this).next().next().addClass("hide");
			}
		});
		//处理某些手机键盘收起时出现白块
		$(document).on("blur",".login_input input",function(){
			if(document.activeElement.nodeName.toUpperCase() != "INPUT"){
				document.body.scrollTop = 0;
			}
		});
		//focus 处理输入框尾部图标显示隐藏
		$(document).on("focus",".login_input input",function(){
			if($(this).val() != ""){
				$(this).next(".clearInput").removeClass("hide");
			}else{
				$(this).next(".clearInput").addClass("hide");
			}
			if($(this).attr("id") == "password"){
				$(this).next().next().removeClass("hide");
				$(this).parents('p').next('.tip').removeClass('hide');
			}
			
		});
		//keyup 处理登录按钮是否可点
		$(document).on("keyup","#ct .login_input input",function(){
			var flg = true;
			$("#ct .login .login_input input").each(function(index,item){
				if($(item).val()==""){
					flg = false;
				}
			});
			if($(".zhe800_xy").hasClass("no")){
				flg = false;
			}
			if(flg){
				$(".login .btnSubmit").removeClass("disable");
				$(".login .btnSubmit").addClass("enable");
			}else{
				$(".login .btnSubmit").removeClass("enable");
				$(".login .btnSubmit").addClass("disable");
			}	
		});

		//
		$(document).on("keyup","#phone_number",function(){
			var value = $(this).val().replace(/\s+/g,"");
			$(this).val(value);
		});
		//动态验证码监听
		$(document).on("keyup","#phone_number",function(){
			var reg = new RegExp($(this).attr("reg"));
			if(reg.test($(this).val())){
				if(!$("#getCaptcha").hasClass("isCountDown")){
					$("#getCaptcha").removeClass("disable").addClass("enable");
				}
				if(!$("#voiceCaptcha").hasClass("isCountDown")){
					$("#voiceCaptcha").removeClass("disable").addClass("enable");
				}
			}else{
				if(!$("#getCaptcha").hasClass("isCountDown")){
					$("#getCaptcha").removeClass("enable").addClass("disable");
				}
				if(!$("#voiceCaptcha").hasClass("isCountDown")){
					$("#voiceCaptcha").removeClass("enable").addClass("disable");
				}
			}
		});
		$(document).on("focus","#phone_number",function(){
			var reg = new RegExp($(this).attr("reg"));
			if(reg.test($(this).val())){
				if(!$("#getCaptcha").hasClass("isCountDown")){
					$("#getCaptcha").removeClass("disable").addClass("enable");
				}
				if(!$("#voiceCaptcha").hasClass("isCountDown")){
					$("#voiceCaptcha").removeClass("disable").addClass("enable");
				}
			}else{
				if(!$("#getCaptcha").hasClass("isCountDown")){
					$("#getCaptcha").removeClass("enable").addClass("disable");
				}
				if(!$("#voiceCaptcha").hasClass("isCountDown")){
					$("#voiceCaptcha").removeClass("enable").addClass("disable");
				}
			}
		});
		//清除按钮点击事件
		$.zheui.bindTouchGoto($(".clearInput"),function(_this){
			_this.prev("input").val("");
			var ele = _this.prev("input");
			if(ele.attr("id") == "password"){
				_this.next(".tip").addClass("hide");
			}
			ele.trigger("keyup");
		});
		//眼睛按钮点击事件
		$.zheui.bindTouchGoto($(".pass2text_btn"),function(_this){
			var type = _this.prev().prev().attr("type");
            if(type == "password"){
				_this.prev().prev().attr("type","text");
				_this.removeClass("showText").addClass("showPass");
            }else if(type == "text"){
				_this.prev().prev().attr("type","password");
				_this.removeClass("showPass").addClass("showText");
            }
		});
		//注册协议绑定选择事件
		$.zheui.bindTouchGoto($(".zhe800_xy i"),function(_this){
			var flg = true;
			if(_this.parent().hasClass("no")){
				$(".zhe800_xy").removeClass("no");
				_this.next("input").val("true");
				flg = true;
			}else{
				$(".zhe800_xy").addClass("no");
				_this.next("input").val("false");
				flg = false;
			}
			$(".login .login_input input").each(function(index,item){
				if($(item).val()==""){
					flg = false;
				}
			});
			if(flg){
				$(".login .btnSubmit").removeClass("disable");
				$(".login .btnSubmit").addClass("enable");
			}else{
				$(".login .btnSubmit").removeClass("enable");
				$(".login .btnSubmit").addClass("disable");
			}	
		});
		$.zheui.bindTouchGoto($("#protocol"),function(){
			var url = encodeURIComponent("http://th5.m.zhe800.com/h5/aboutcontract");
			window.location.href = "zhe800://m.zhe800.com/c/web?url=" + url;
		});
		//登录、注册按钮点击事件
		$.zheui.bindTouchGoto($(".btnSubmit"),function(_this){
			var type = _this.attr("type");
			if(_this.hasClass("enable")){
				if(checkInput($(".login .login_input input"))){
					document.activeElement.blur();
					document.body.scrollTop = 0;
					window.innerHeight = $.cookie.get("winheight") || window.innerHeight;
					if(type == "account"){
						login();
					}else if(type == "register"){
						register();
					}else if(type == "findPwd"){
						findPwd();
					}
				}
			}
		});
		/**
		两级验证时获取验证码的流程：
		1.如果页面不存在token，则弹出图片验证码，然后验证，然后进行二级验证码
		2.如果页面存在token，直接申请二级验证码，申请不通过时弹出图片验证码，继续1流程
		**/
		//获取短信验证码的点击事件
		$.zheui.bindTouchGoto($("#getCaptcha"),function(_this){
			if(_this.hasClass("isCountDown")){
				$.zheui.toast("验证码60秒发送一次，请稍后重试");
			}
			if(_this.hasClass("enable")){
				var validate_type = 4,
					key = _this.attr("key"); 
				if(!_this.hasClass("isCountDown")){
					if($("#validate_token").length == 0){
						document.activeElement.blur();
						// alert("aaa");
						Captcha.getImageCaptchaDialog(key,validate_type);
					}else{
						Captcha.getNextCaptcha(key,validate_type,$("#phone_number").val());
					}
				}
			}
		});
		//获取语音验证码的点击事件
		$.zheui.bindTouchGoto($("#voiceCaptcha"),function(_this){
			if(_this.hasClass("isCountDown")){
				$.zheui.toast("验证码60秒发送一次，请稍后重试");
			}
			if(_this.hasClass("enable")){
				var validate_type = 5,
					key = _this.attr("key"); 
				if(!_this.hasClass("isCountDown")){
					if($("#validate_token").length == 0){
						Captcha.getImageCaptchaDialog(key,validate_type);
					}else{
						Captcha.getNextCaptcha(key,validate_type,$("#phone_number").val());
					}
				}
			}
		});
		//快速注册、忘记密码
		$.zheui.bindTouchGoto($(".trans_direction"),function(_this){
			var key = _this.attr("site");
			if(key == "register"){
				//快速注册跳转
				if(getPlatform() == "zheclient"){
					window.location.href = "//m.zhe800.com/native_register?pub_page_from="+getPlatform();
				}else if(getPlatform() == "oneclient"){
					var params = {
						"title":"注册",
						"url":"http://m.zhe800.com/native_register?pub_page_from=oneclient",
						"clearhistory":0
					}
					$.common.loadpage(params);
				}
			}else if(key == "findPwd"){
				//忘记密码跳转
				if(getPlatform() == "zheclient"){
					var title = encodeURIComponent("忘记密码");
	            	window.location.href = "zhe800://m.zhe800.com/mid/account/retrieve_pwd?title="+title;
	    //         	var params = {
					// 	"title":"找回密码",
					// 	"url":"http://m.zhe800.com/native_findPwd?pub_page_from=oneclient",
					// 	"clearhistory":0
					// }
					// $.common.loadpage(params);
				}else if(getPlatform() == "oneclient"){
					// window.location.href = "//m.zhe800.com/native_findPwd?pub_page_from="+getPlatform();
					var params = {
						"title":"找回密码",
						"url":"http://m.zhe800.com/native_findPwd?pub_page_from=oneclient",
						"clearhistory":0
					}
					$.common.loadpage(params);
				}
			}
		});
	}
	//检查用户输入
	function checkInput(arr){
		var ischeck = true;
		arr.each(function(){
			var _val = $(this).val(),
				regstr = $(this).attr("reg");
			if(regstr){
				var regarr = regstr.split("#"),
					msgarr = $(this).attr("msg").split("#");
				for(var i = 0,l = regarr.length; i < l; i += 1){
					var re = new RegExp(regarr[i]);
					if(!re.test(_val)){
						$.zheui.toast(msgarr[i]);
						ischeck = false;
						return false;
					}
				}	
			}else {
				var msgstr = $(this).attr("msg");
				if(msgstr){
					if(_val == ""){
						$.zheui.toast(msgstr);
						ischeck = false;
						return false;
					}else if($(this).attr("type") == "password"){
						var passval = $("#password").val();
						if(passval != $(this).val()){
							$.zheui.toast("输入的密码不一致");
							ischeck = false;
							return false;
						}
					}
				}
			}
			if($(".zhe800_xy").hasClass("no")){
				$.zheui.toast("请选择同意折800注册协议");
				ischeck = false;
				return false;
			}
		});
		return ischeck;
	}
	//setp1:获取native信息并持久化到cookie
	function set_info_to_cookie(){
		var native_info = {};
		$.common.get_nativeinfo("$.calljs.get_nativeinfocallback");
		$.calljs.get_nativeinfocallback = function(data){
			native_info = JSON.parse(data);
			// alert(native_info.source);
			$.each(native_info,function(name,value){
				$.cookie.set(name,value);
			});
		};
	}
	function set_title(title){
		var params = {
			"title":title
		}
		$.common.set_title(params);
	}
	//setp2:获取客户端支持的第三方，并展示在页面
	//那就是{"qq":1,"wechat":2}
	function support_thirdApp(){
		$(".other_login").removeClass("hide");
		var data_info = {};
		$.common.get_thirdappstatus("$.calljs.get_thirdappstatuscallback");
		$.calljs.get_thirdappstatuscallback = function(data){
			data = JSON.parse(data);
			var $node = $(".other_login p"),
				str = "";
			//根据协议进行第三方的展示
			if(data.wechat == true){
				str += "<span><a class='trans_direction wechat' site='thirdWechat' title='微信登录' alt='微信登录'></a></span>";
			}
			if(data.qq == true){
				str += "<span><a class='trans_direction qq' site='thirdQq' title='QQ账号登录' alt='QQ账号登录'></a></span>";
			}
			str += "<span><a class='trans_direction more' site='thirdMore' title='更多登录方式' alt='更多登录方式'></a></span>";
			$node.html(str);
			//第三方登录，根据协议调起第三方
			$.zheui.bindTouchGoto($(".trans_direction"),function(_this){
				var	key = _this.attr("site");
		
				if(key == "thirdQq"){
					var params = {
						"type":"1"
					}
					
					$.common.open_thirdApp(params);
				}else if(key == "thirdWechat"){
					var params = {
						"type":"2"
					}
					
					$.common.open_thirdApp(params);
				}else if(key == "thirdMore"){
					if($("#third").length == 0){
						var html = "<div class='dialog-fixed' id='third'><div class='bg_layer' style='display:block;opacity:1'></div><div class='box'><p>使用以下账号直接登录</p><p class='trans'><span><a class='trans_direction taobao' site='thirdTaobao' title='淘宝登录' alt='淘宝登录'></a></span><span><a class='trans_direction weibo' site='thirdWeibo' title='微博登录' alt='微博登录'></a></span></p></div><span class='btn_cancle'>取消</span></div>";
						$("body").append(html);
						$.zheui.bindTouchGoto($("#third .btn_cancle"),function(_this){
							
							$("#third").addClass("hide");
						});
						$.zheui.bindTouchGoto($(".trans_direction"),function(_this){
							
							var	key = _this.attr("site");
							
							if(key == "thirdTaobao"){
								$("#third").addClass("hide");
								var params = {
									"type":"3"
								}
								$.common.open_thirdApp(params);
							}else if(key == "thirdWeibo"){
								$("#third").addClass("hide");
								var params = {
									"type":"4"
								}
								$.common.open_thirdApp(params);
							}
						});
					}else{
						$("#third").removeClass("hide");
					}
					
				}
			});
		}
	}
	//登录函数
	function login(){
		var data = {
			userName:$("#user_name").val(),
			password:$("#password").val(),
			validateToken:$("#validate_token").val(),
			businessCode:$("#businesscode").val(),
			captcha:$("#captcha").val(),
			deviceId:$.cookie.get("deviceId"),
			platform:$.cookie.get("platform"),
			version:$.cookie.get("version"),
			source:$.cookie.get("source")
		};
		$.zheui.loadingbar("show","请求中，请稍后...");
		
		$.ajax({
			type:"get",
			url:"https://passport.zhe800.com/j/h5/login",
			dataType:"jsonp",
			jsonp:"callback",
			data:data,
			beforeSend:function(){
				$(".btnSubmit").text("正在登录...");
			},
			success:function(data){
				var _data = data;
				if(typeof _data == "object") {
					$(".btnSubmit").text("登录");
					// $.common.loadingbar({"type":"0","cmd":"hide","text":"请求中，请稍后..."});
					$.zheui.loadingbar("hide","请求中，请稍后...");
					if(_data.status == 200){
						window.localStorage["h5_user_name"] = $("#user_name").val();

						//根据协议将参数传给客户端，客户端进行后续流程
						data["_ptype"] = "login";
						$.common.set_status(data);

					}else if(_data.code == 400){
						//白名单功能 is_safety == 1时启动白名单，弹出弹框，点击确认跳转到找回密码页面
						if(_data.is_safety == 1){
							var html = "<h2 style='text-align:center;font-size: 18px;line-height: 60px;font-weight: 600;color:#333333;'>密码已失效</h2>";
								html += "<p style='text-align:center;font-size: 16px;padding-bottom: 20px;border-bottom: 1px solid #d7d7d7;'>" + _data.err_msg + "</p>";
								html += "<p id='whilte-findpwd' type='button' style='text-align:center;font-size: 18px;line-height: 40px;font-weight: 600;color:#333333'>确认</p>";
							mydialog.create("2",html);
							$.zheui.bindTouchGoto($("#whilte-findpwd"),function(_this){
								if(getPlatform() == "zheclient"){
									var title = encodeURIComponent("忘记密码");

									window.location.href = "zhe800://m.zhe800.com/mid/account/retrieve_pwd?title="+title;
								}else if(getPlatform() == "oneclient"){
									window.location.href = "//m.zhe800.com/native_findPwd?pub_page_from="+getPlatform();
								}
							});
							document.activeElement.blur();
							mydialog.show();
						}else{
							if(_data.tip_key == "failed_alert_count"){
								$.zheui.toast(_data.tip);
							}else if(_data.tip_key == "locking" || _data.tip_key == "locked"){
								document.activeElement.blur();
								var html = "<p style='font-size: 20px;text-align: center;margin: 20px auto;'>"+_data.err_msg+"</p>";
								html += "<p style='line-height: 1.5;padding: 0 20px;'>1.已绑定手机号用户请通过忘记密码设置新密码<br>2.未绑定手机号用户，请联系客服：400－061－1800</p>";
								html += "<button id='locked-sure' style='border: 0;cursor: pointer;color: #FFF;width: 90%;border-radius: 2px;height: 40px;text-align: center;font: 16px/40px 微软雅黑;display: block;margin: 20px auto;background: -webkit-linear-gradient(left, #ef4949, #ef4949);'>确定</button>"
								mydialog.create("2",html);
								mydialog.show();
								$.zheui.bindTouchGoto($("#locked-sure"),function(_this){
									mydialog.hide();
								});
								
							}else{
								$.zheui.toast(_data.err_msg);
							}
							//登录失败，根据need_captcha判断是否需要用户输入验证码，从而动态生成验证码输入框
							if($("#captcha").length == 0){
								if(_data.need_captcha){
									// $(".btnSubmit").addClass("disable");
									$.zheui.toast("请输入验证码");
									Captcha.getImageCaptcha("account_login");
								}
							}else{
								Captcha.changeCaptcha("account_login",$(".e_change_captcha_normal"));
								$("#captcha").val("");
								$("#captcha").trigger("keyup");
							}
						}
					}
				}
			},
			timeout:20000,
			error:function(){
				$(".btnSubmit").text("登录");
				// $.common.loadingbar({"type":"1","cmd":"hide","text":"请求中，请稍后..."});
				$.zheui.loadingbar("hide","请求中，请稍后...");
				$.zheui.toast("网络异常，请稍后再试");
			}
		});
	}
	//注册函数
	function register(){
		var data = {
			phoneNumber:$("#phone_number").val(),
			validateToken:$("#token").val(),
			phoneConfirmation:$("#phone_confirmation").val(),
			// businessCode:$("#businesscode").val(),
			step:2,
			password:$("#password").val(),
			passwordConfirmation:$("#password").val(),
			registerSource:"app",
			deviceId:$.cookie.get("deviceId"),
			platform:$.cookie.get("platform"),
			version:$.cookie.get("version"),
			source:$.cookie.get("source")
		};
		// $.common.loadingbar({"type":"1","cmd":"show","text":"请求中，请稍后..."});
		$.zheui.loadingbar("show","请求中，请稍后...");
		$.ajax({
			type:"get",
			url:"https://passport.zhe800.com/j/h5/phone_register",
			dataType:"jsonp",
			jsonp:"callback",
			data:data,
			beforeSend:function(){
				$(".btnSubmit").text("正在提交...");
			},
			success:function(data){
				var _data = data;
				if(typeof _data == "object") {
					$(".btnSubmit").text("注册");
					// $.common.loadingbar({"type":"1","cmd":"hide","text":"请求中，请稍后..."});
					$.zheui.loadingbar("hide","请求中，请稍后...");
					if(_data.status == 200){

						$.zheui.toast("注册成功");
						//注册成功后，根据协议传递参数给客户端，客户端进行后续流程
						data["_ptype"] = "register";
						$.common.set_status(data);

						// directUrl();
					}else if(_data.code == 400){
						$.zheui.toast(_data.err_msg);
					}
				}
			},
			timeout:20000,
			error:function(){
				$(".btnSubmit").text("注册");
				// $.common.loadingbar({"type":"1","cmd":"hide","text":"请求中，请稍后..."});
				$.zheui.loadingbar("hide","请求中，请稍后...");
				$.zheui.toast("网络异常，请稍后再试");
			}
		});
	}
	//找回密码函数
	function findPwd(){
		var data = {
			phoneNumber:$("#phone_number").val(),
			validateToken:$("#token").val(),
			phoneConfirmation:$("#phone_confirmation").val(),
			// businessCode:$("#businesscode").val(),
			step:2,
			password:$("#password").val(),
			// passwordConfirmation:$("#password").val(),
			registerSource:"app",
			deviceId:$.cookie.get("deviceId"),
			platform:$.cookie.get("platform"),
			version:$.cookie.get("version"),
			source:$.cookie.get("source")
		};
		// $.common.loadingbar({"type":"1","cmd":"show","text":"请求中，请稍后..."});
		$.zheui.loadingbar("show","请求中，请稍后...");
		$.ajax({
			type:"get",
			url:"https://passport.zhe800.com/j/h5/retrieve_password",
			dataType:"jsonp",
			jsonp:"callback",
			data:data,
			beforeSend:function(){
				$(".btnSubmit").text("正在提交...");
			},
			success:function(data){
				var _data = data;
				if(typeof _data == "object") {
					$(".btnSubmit").text("提交");
					// $.common.loadingbar({"type":"1","cmd":"hide","text":"请求中，请稍后..."});
					$.zheui.loadingbar("hide","请求中，请稍后...");
					if(_data.code == 0){

						$.zheui.toast("修改密码成功，稍后请用密码重新登录");
						//注册成功后，根据协议传递参数给客户端，客户端进行后续流程
						data["_ptype"] = "findPwd";
						$.common.set_status(_data);

						// directUrl();
					}else if(_data.code == 1){
						$.zheui.toast(_data.msg);
					}
				}
			},
			timeout:20000,
			error:function(){
				$(".btnSubmit").text("提交");
				// $.common.loadingbar({"type":"1","cmd":"hide","text":"请求中，请稍后..."});
				$.zheui.loadingbar("hide","请求中，请稍后...");
				$.zheui.toast("网络异常，请稍后再试");
			}
		});
	}
	//客户端调用清除localStorage
    $.calljs.removeLocalStorage = function(key) {
        window.localStorage.removeItem(key);
    };

    //zheclient:zhe800客户端
    //oneclient:一元夺宝客户端
    function getPlatform(){
    	return $.zheui.getUrlKeyVal("pub_page_from");
    };
 	/**
	初始化函数
	初始化绑定事件，协议调用，是否需要验证码请求
 	**/
	function zheclientInit(){
		$.cookie.set("winheight",window.innerHeight);
		$("#login-bannerImg").attr("src","//i0.tuanimg.com/ms/zhe800m/dist/img/native_passport/m_login_banner.jpg");
		bindEvent();
		set_info_to_cookie();
		support_thirdApp();
		if($(".btnSubmit").attr("type") == "account"){
			set_title("登录");
	
			if(window.localStorage["h5_user_name"]){
				$("#user_name").val(window.localStorage["h5_user_name"]);
			}
			
			Captcha.isNeedCaptch("account_login");
			// Captcha.getImageCaptcha("account_login");
		}else if($(".btnSubmit").attr("type") == "register"){
			set_title("注册");
			setTimeout(function(){
				$("#phone_number").focus();
			},100);
		}
	}

	function oneclientInit(){
		// alert(window.innerHeight);
		$.cookie.set("winheight",window.innerHeight);
		if($(".btnSubmit").attr("type") == "account"){
			$("<p style='text-indent: 1rem;margin-bottom: -10px;margin-top: 10px;color:#b5b5b5;'>可使用零钱嗨购或折800帐号登录</p>").insertBefore($(".login p").eq(0));
			$("#login-bannerImg").attr("src","//i0.tuanimg.com/ms/zhe800m/dist/img/native_passport/m_login_oneclient.jpg");
			set_title("登录");
			
			if(window.localStorage["h5_user_name"]){
				$("#user_name").val(window.localStorage["h5_user_name"]);
			}
			
			Captcha.isNeedCaptch("account_login");
			// Captcha.getImageCaptcha("account_login");
		}else if($(".btnSubmit").attr("type") == "register"){
			$("<p style='text-indent: 1rem;margin-bottom: -10px;margin-top: 10px;color:#b5b5b5;'>注册后系统将同步为您注册折800帐号</p>").insertBefore($(".login p").eq(0));

			$("#protocol").html("零钱嗨购用户注册协议");

			set_title("注册");

			setTimeout(function(){
				$("#phone_number").focus();
			},100);
		}else if($(".btnSubmit").attr("type") == "findPwd"){
			set_title("找回密码");
		}
		bindEvent();
		set_info_to_cookie();
	}

	if(getPlatform() == "oneclient"){
		oneclientInit();
	}else if(getPlatform() == "zheclient"){
		zheclientInit();
	}
	// init();

});