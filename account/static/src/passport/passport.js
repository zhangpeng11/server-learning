    /*
     *author: wangguanjia@rd.tuan800.com 2015.6.23
     *modify: wangguanjia@rd.tuan800.com 2016.2.1
     *dependent:zepto.base
     *allot:mobile site passport module
     *notice:ajax must change https before you want to publish file to production enviroment
     */
    define(function(require, exports, module) {
        var $ = require("zepto");
        require("../common/base");
        var track = require("../common/track_v2");
        //初始化htt-header
        track.init("M");
        //添加pos_type和pos_value
        var track_data = {};
        if(window.location.pathname == "/login"){
            track_data = {
                pos_value:"login",
                pos_type:"login",
            };
        }
        else if(window.location.pathname == "/register"){
            track_data = {
                pos_value:"register",
                pos_type:"register",
            };
        }
        else{
            track_data = {
                pos_value:"findpwd",
                pos_type:"findpwd",
            };
        }
        //将track_data写入cookie
        $.tracklog.addCokkie(track_data);
        require("../common/callnative");
        var dialog = require("../common/dialog");
        var mydialog = new dialog();
        // 记录打点值类，暂时存储在内存中
        var label={
            login_type:""
        }
        //弹出验证码的类
        var Passport = {
            ppf: $.zheui.newGetUrlKeyVal("pub_page_from") ? $.zheui.newGetUrlKeyVal("pub_page_from") : '',
            adapt:function(){
                var key = $.zheui.newGetUrlKeyVal("src");
                if(key == 'app'){
                    $(".breadcrumb").hide();
                }else{
                    return void 0;
                }
            },
            //绑定手机号
            bindPhone:function(){
                $.tracklog.action("fbindphone");
                $.zheui.loadingbar("show", "请求中，请稍后...");
                var pt = $.zheui.getUrlKeyVal("pt"),
                    that = this,
                    data = getInputVal($(".reg_box input")),
                    pId = $.zheui.getUrlKeyVal("partner_id");
                /**卫茹修改 添加token**/
                if($("#captcha_token").val() != ""){
                    // 语音验证码传递数据结构
                    data += "&validate_token=" + $("#captcha_token").val();
                    data += "&partner_id=" + pId;
                    data += "&partner_type=" + pt;
                    data += "&step=2";
                    data += "&business_code="+$("#business_code").val();
                }else{
                    // 短信验证码传递数据结构
                    data += "&partner_id=" + pId;
                    data += "&partner_type=" + pt;                  
                }
                $.ajax({
                    type: "get",
                    url: "https://passport.tuan800.com/wap3/users/partner_register?",
                    data: data,
                    dataType: "jsonp",
                    jsonp: "callback",
                    beforeSend: function() {
                        $('.btnSubmit').text("正在提交...");
                    },
                    success: function(data) {
                        var _data = data;
                        var ppf = _data.platform;
                        // console.log("third bind",_data);
                        // console.log("ajax status",_data.status);
                        // alert(_data.platform);
                        if(ppf == 'app'){
                            if (typeof _data == "object") {
                                // $('.btnSubmit').text("提交");
                                // $.zheui.loadingbar("hide", "请求中，请稍后...");
                                // if (_data.status == 200) {
                                //         var iframe = document.getElementById('#openApp');
                                //         if(iframe){
                                //             iframe.src = 'zhe800://goto_home';
                                //         }else{
                                //             iframe = document.createElement('iframe');
                                //             iframe.id = 'openApp';
                                //             iframe.src = 'zhe800://goto_home';
                                //             iframe.style.display = 'none';
                                //             document.body.appendChild(iframe);
                                //         }
                                //     } else {
                                //         $.zheui.toast(_data.message);
                                //     }
                                // }
                                $('.btnSubmit').text("立即绑定");
                                $.zheui.loadingbar("hide", "请求中，请稍后...");
                                if(_data.status == 200) {
                                    // alert("return_url",_data.return_to_url);
                                    var url = _data.return_to_url;
                                    window.location.href = url;
                                     // return void 0;
                                    // $.zheui.toast("绑定成功");
                                    // setTimeout("$.zheui.directUrlThird()", 2000);
                                }else if(_data.status == 404){
                                    // 会话超时,授权失败
                                    $.zheui.toast("授权限失败");
                                    window.location.href = '//m.zhe800.com/login';
                                }else if(_data.status == 0){
                                    $.zheui.toast(_data.msg.error_content);
                                }else{
                                    $.zheui.toast(_data.message);
                                }
                            }  
                        }else{
                            if (typeof _data == "object") {
                                $('.btnSubmit').text("立即绑定");
                                $.zheui.loadingbar("hide", "请求中，请稍后...");
                                if (_data.status == 200) {
                                    $.zheui.toast("绑定成功");
                                    var url = _data.return_to_url;
                                    window.location.href = url;
                                }else if(_data.status == 404){
                                    // 会话超时,授权失败
                                    $.zheui.toast("授权限失败");
                                    window.location.href = '//m.zhe800.com/login';
                                }else if(_data.status == 0){
                                    $.zheui.toast(_data.msg.error_content);
                                }else{
                                    $.zheui.toast(_data.message);
                                }
                            } 
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        $('.btnSubmit').text("立即绑定");
                        //console.log("网络异常");
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        $.zheui.toast("网络异常，请稍后再试.");
                    }
                });
            },
            //安全措施，弹出图片验证码
            renderSecurity: function() {
                this.needCaptcha();
                console.log("renderSecurity start");
            },
            //弹出验证码函数
            needCaptcha: function() {
                console.log("passpoort needCaptcha start");
                $.ajax({
                    type: "get",
                    url: "https://acode.tuanimg.com/captcha/get_image?jsonp=1",
                    data: { _: new Date().getTime() },
                    dataType: "jsonp",
                    success: function(data) {
                        var _data = data;
                        // console.log(_data);
                        if (typeof _data == "object") {
                            $('.btnSubmit').text("登录");
                            // $.zheui.loadingbar("hide", "请求中，请稍后...");
                            if (_data.url != '' && _data.keywords != '') {
                                // if ($('#captcha').length == 0) {
                                    //$('.captcha_area').remove();

                                    /**卫茹修改 图片验证码弹窗弹窗
                                     * 防止弹窗冲突，短信验证码中的弹窗添加pop_captcha类
                                     ***/
                                    var  captcha_token = $("#captcha_token").val() || "";
                                    var  business_code = $("#business_code").val() || "";
                                    var htmlStr = "<div class='login pop_captcha' style='margin:0;padding:0;display:inline'>";
                                    htmlStr +="<button type='button' class='pos_r captcha_close' id='btn_close'></button>"
                                    htmlStr += "<p class='pos_r captcha_area captcha_title'>为保证安全，请先提交图片验证码</p><p class='login_input login_input_name pos_r captcha_area' style='border:none;'><input id='captcha' name='captcha' placeholder='图片验证码' type='text' msg='验证码不能为空' reg='(^\s*)|(\s*$)' style='border: solid 1px #d5d5d5;border-radius: 3px'><image id='e_change_captcha' class='fr' src='" + _data.url + "'></p><p class='pos_r djtphyz' style='color:#9d9d9d; fontSize:9px; text-align:right; margin:0 3%; border-top:none; border-bottom:none;'>点击图片换一张</p><p class='pos_r captcha_area captcha_button'><button id='confirm_security_button'>提交</button></p>";
                                    htmlStr +="<p class='captcha_area'><input type='hidden' id='captcha_keywords' name='captcha_keywords' value='" + _data.keywords + "'></p>";
                                    htmlStr +="<p class='captcha_area'><input type='hidden' id='captcha_token' name='captcha_token' value='" + _data.validate_token + "'></p>";
                                    htmlStr +="<p class='captcha_area'><input type='hidden' id='business_code' name='business_code' value='" + business_code + "'></p>";
                                    htmlStr +="</div>";
                                    mydialog.create("2",htmlStr);
                                    $(".pop_captcha").find("#captcha_token").val(captcha_token);
                                    $(".pop_captcha").find("#business_code").val(business_code);
                                    $(".breadcrumb_login a").css("opacity",0);
                                    /**卫茹修改 弹窗修改完毕**/

                                    /**卫茹修改 通pop_captcha类查询来确定点击事件**/
                                    $.zheui.bindTouchGoto($(".pop_captcha").find("#btn_close"),function(_this){
                                        mydialog.hide();
                                        $(".breadcrumb_login a").css("opacity",1);
                                    });
                                    $.zheui.bindTouchGoto($(".pop_captcha").find("#confirm_security_button"), function(_this) {
                                        var key = $("#getCaptcha").attr('key');
                                        if ($(".pop_captcha").find("#captcha").val() != '') {
                                            if ($('#getCaptcha').hasClass('enable')) {
                                                if ($('#getCaptcha').hasClass("isCountDown") == false) {
                                                    Passport.getCaptcha(key);
                                                    _this.text("提交中...");
                                                }
                                            }
                                        } else {
                                            $.zheui.toast("请输入图片验证码");
                                        }
                                    });
                                    $.zheui.bindTouchGoto($(".pop_captcha").find("#e_change_captcha"), function(_this) {
                                        Passport.changeCaptcha();
                                    });

                                }
                            }
                        },
                        timeout: 20000,
                        error: function() {
                            $.zheui.toast("网络异常，请稍后再试.");
                            $("#confirm_security_button").text("提交");
                        }
                    });
            },
            /*
                *获取验证码
                *0 普通注册   sms_login=false
                *1 短信免注册 sms_login=true
                *2 找回密码 sms_login=false registered=true
                *3 第三方账号绑定
                *4 第三方账号绑定 for_partner_bind_phone_number=force strategy for_bind_phone_number=true
                *callback: {"status":"200","message":"恭喜你，用户注册成功快去领红
                 包吧","return_to":"http://ddd.dd.com/ddd/dd"}
            */
            getCaptcha: function(type) {
                    /**卫茹修改 通过pop_captcha类获取短信验证码中的图片验证码的值**/
                    var phone = $("#phone_number").val(),
                        captcha = $(".pop_captcha").find("#captcha").val(),
                        captcha_key = $(".pop_captcha").find("#captcha_keywords").val();
                    /**卫茹修改 完毕**/
                    if (phone != '') {
                        if (type == 0) {
                            //console.log("普通注册获取验证码");
                            $.ajax({
                                type: "get",
                                url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&captcha=" + captcha + "&captcha_keywords=" + captcha_key + "&sms_login=false&for_bind_phone_number=false&registered=false",
                                dataType: "jsonp",
                                jsonp: "callback",
                                success: function(data) {
                                    console.log(data);
                                    var _data = data;
                                    if (typeof _data == "object") {
                                        if (_data.status == 200 || _data.status == 201) {
                                            /**卫茹修改 隐藏弹窗**/
                                            mydialog.hide();
                                            /**end**/
                                            $.zheui.toast(_data.message);
                                            CountDown(60);
                                            //$('.djtphyz').remove();
                                        } else if (_data.status == 400) {
                                            /**卫茹修改 隐藏弹窗**/
                                            mydialog.hide();
                                            /**end**/
                                            $.zheui.toast(_data.message);
                                            $("#confirm_security_button").text("提交");
                                        } else if (_data.status == 401) {
                                            $.zheui.toast(_data.message);
                                            $("#confirm_security_button").text("提交");
                                            Passport.changeCaptcha();
                                        } else if (_data.status == 402) {
                                            Passport.renderSecurity();
                                        } else {
                                            $.zheui.toast(_data.message);
                                            $("#confirm_security_button").text("提交");
                                        }
                                    }
                                },
                                timeout: 20000,
                                error: function() {
                                    $.zheui.toast("网络异常，请稍后再试.");
                                    $("#confirm_security_button").text("提交");
                                }
                            });
                        } else if (type == 1) {
                            //console.log("短信免注册获取验证码");
                            $.ajax({
                                type: "get",
                                url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&captcha=" + captcha + "&captcha_keywords=" + captcha_key + "&sms_login=true&for_bind_phone_number=false&registered=false",
                                //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                                dataType: "jsonp",
                                jsonp: "callback",
                                success: function(data) {
                                    var _data = data,
                                        status = _data.status;
                                    console.log(_data);
                                    //用户不存在，直接登录
                                    if (_data.status == 201) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $(".breadcrumb_login a").css("opacity",1);
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', 'new');
                                        $('.phone_section #phone_number').attr('name', 'phone_number');
                                    } else if (_data.status == 202) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', '0');
                                        $('.phone_section #phone_number').attr('name', 'user_name');
                                    } else if (_data.status == 400) {
                                            /**卫茹修改 隐藏弹窗**/
                                            mydialog.hide();
                                            /**end**/
                                            $(".breadcrumb_login a").css("opacity",1);
                                            $.zheui.toast(_data.message);
                                            $("#confirm_security_button").text("提交");
                                        }  else if (_data.status == 401) {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                        Passport.changeCaptcha();
                                    } else if (_data.status == 402) {
                                        Passport.renderSecurity();
                                    } else {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                    }
                                },
                                timeout: 20000,
                                error: function() {
                                    console.log("网络异常");
                                    $.zheui.toast("网络异常，请稍后再试.");
                                    $("#confirm_security_button").text("提交");
                                }
                            });
                        } else if (type == 2) {
                            //console.log("找回密码获取验证码");
                            $.ajax({
                                type: "get",
                                url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&captcha=" + captcha + "&captcha_keywords=" + captcha_key + "&sms_login=false&registered=true",
                                //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                                dataType: "jsonp",
                                jsonp: "callback",
                                success: function(data) {
                                    //console.log(data);
                                    var _data = data;
                                    //用户不存在，直接登录
                                    if (_data.status == 201) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', 'new');
                                        $('.phone_section #phone_number').attr('name', 'phone_number');
                                    } else if (_data.status == 202) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', '0');
                                        $('.phone_section #phone_number').attr('name', 'user_name');
                                    } else if (_data.status == 400) {
                                            /**卫茹修改 隐藏弹窗**/
                                            mydialog.hide();
                                            $(".breadcrumb_login a").css("opacity",1);
                                            /**end**/
                                            $.zheui.toast(_data.message);
                                            $("#confirm_security_button").text("提交");
                                        }  else if (_data.status == 401) {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                        Passport.changeCaptcha();
                                    } else if (_data.status == 402) {
                                        Passport.renderSecurity();
                                    } else {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                    }
                                },
                                timeout: 20000,
                                error: function() {
                                    $.zheui.toast("网络异常，请稍后再试.");
                                    $("#confirm_security_button").text("提交");
                                }
                            });
                        } else if (type == 3) {
                            // 第三章账号绑定
                            $.ajax({
                                type: "get",
                                url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&captcha=" + captcha + "&captcha_keywords=" + captcha_key + "&sms_login=false&registered=true",
                                //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                                dataType: "jsonp",
                                jsonp: "callback",
                                success: function(data) {
                                    //console.log(data);
                                    var _data = data;
                                    //用户不存在，直接登录
                                    if (_data.status == 201) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', 'new');
                                        $('.phone_section #phone_number').attr('name', 'phone_number');
                                    } else if (_data.status == 202) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', '0');
                                        $('.phone_section #phone_number').attr('name', 'user_name');
                                    } else if (_data.status == 400) {
                                            /**卫茹修改 隐藏弹窗**/
                                            mydialog.hide();
                                            $(".breadcrumb_login a").css("opacity",1);
                                            /**end**/
                                            $.zheui.toast(_data.message);
                                            $("#confirm_security_button").text("提交");
                                        }  else if (_data.status == 401) {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                        Passport.changeCaptcha();
                                    } else if (_data.status == 402) {
                                        Passport.renderSecurity();
                                    } else {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                    }
                                },
                                timeout: 20000,
                                error: function() {
                                    $.zheui.toast("网络异常，请稍后再试.");
                                    $("#confirm_security_button").text("提交");
                                }
                            });
                        } else if (type == 4) {
                            //console.log("找回密码获取验证码");
                            var pt = $.zheui.getUrlKeyVal("pt");
                            $.ajax({
                                type: "get",
                                url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&captcha=" + captcha + "&captcha_keywords=" + captcha_key + "&for_partner_bind_phone_number=force&&sms_login=false&for_bind_phone_number=true&strategy="+pt,
                                //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                                dataType: "jsonp",
                                jsonp: "callback",
                                success: function(data) {
                                    //console.log(data);
                                    var _data = data;
                                    //用户不存在，直接登录
                                    if (_data.status == 201) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', 'new');
                                        $('.phone_section #phone_number').attr('name', 'phone_number');
                                    } else if (_data.status == 202) {
                                        /**卫茹修改 隐藏弹窗**/
                                        mydialog.hide();
                                        /**end**/
                                        $.zheui.toast(_data.message);
                                        CountDown(60);
                                        $('.btnSubmit').attr('auth', '0');
                                        $('.phone_section #phone_number').attr('name', 'user_name');
                                    } else if (_data.status == 400) {
                                            /**卫茹修改 隐藏弹窗**/
                                            mydialog.hide();
                                            $(".breadcrumb_login a").css("opacity",1);
                                            /**end**/
                                            $.zheui.toast(_data.message);
                                            $("#confirm_security_button").text("提交");
                                        }  else if (_data.status == 401) {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                        Passport.changeCaptcha();
                                    } else if (_data.status == 402) {
                                        Passport.renderSecurity();
                                    } else {
                                        $.zheui.toast(_data.message);
                                        $("#confirm_security_button").text("提交");
                                    }
                                },
                                timeout: 20000,
                                error: function() {
                                    $.zheui.toast("网络异常，请稍后再试.");
                                    $("#confirm_security_button").text("提交");
                                }
                            });
                        } 
                    }
            },
            changeCaptcha: function() {
                    $.getJSON("https://acode.tuanimg.com/captcha/get_image?jsonp=1&callback=?", function(data) {
                        var _data = data;
                        //console.log(_data.message);
                        if (typeof _data == "object") {
                            // $('.btnSubmit').text("登录");
                            // $.zheui.loadingbar("hide", "请求中，请稍后...");
                            // $.zheui.toast(_data.message);
                            if (_data.url != '' && _data.keywords != '') {
                                /**卫茹修改  pop_captcha类下修改验证码**/
                                $(".pop_captcha").find("#e_change_captcha").attr("src",_data.url);
                                $(".pop_captcha").find("#captcha_keywords").val(_data.keywords);
                            }
                        }
                    });
            },
            changeCaptchaN:function(){
                $.getJSON("https://acode.tuanimg.com/captcha/get_image?jsonp=1&callback=?", function(data) {
                        var _data = data;
                        // console.log(_data.url);
                        if (typeof _data == "object") {
                            if (_data.url != '' && _data.keywords != '') {
                                $(".e_change_captcha_normal").attr('src', _data.url);
                                $("#captcha_keywords").val(_data.keywords);
                            }
                        }
                });
            }
        };
        //检查用户输入
        function checkInput(arr) {
            var ischeck = true;
            arr.each(function() {
                var regstr = $(this).attr("reg");
                var _val = $(this).val().replace(/[\s]/g, '');
                if (regstr) {
                    var regarr = regstr.split("#");
                    var msgarr = $(this).attr("msg").split("#");
                    for (var i = 0; i < regarr.length; i++) {
                        var re = new RegExp(regarr[i]);
                        if (!re.test(_val)) {
                            $.zheui.toast(msgarr[i]);
                            ischeck = false;
                            return false;
                        }
                    }
                } else {
                    var msgstr = $(this).attr("msg");
                    if (msgstr) {
                        if (_val == '') {
                            $.zheui.toast(msgstr);
                            ischeck = false;
                            return false;
                        } else if ($(this).attr("type") == "password") {
                            var passval = $("#password").val();
                            if (passval != $(this).val()) {
                                $.zheui.toast("输入的密码不一致");
                                ischeck = false;
                                return false;
                            }
                        }
                    }
                }
                if ($(".zhe800_xy").hasClass("no")) {
                    $.zheui.toast("请选择同意折800注册协议");
                    ischeck = false;
                    return false;
                }
            });
            return ischeck;
        };

        //获取用户输入的内容
        var getInputVal = function(arr) {
            var vals = '';
            $(arr).each(function() {
                if ($(this).val() != '') {
                    vals += "&" + $(this).attr("name") + "=" + $(this).val();
                }
            });
            vals = vals.substring(1, vals.length);
            return vals;
        };

        //倒计时
        function CountDown(num) {
            var num = num;
            var obj = $("#getCaptcha");
            obj.addClass("isCountDown").removeClass("enable").addClass('disable');
            var CountDowning = function() {
                if (num >= 0) {
                    obj.html(num);
                    --num;
                } else {
                    clearInterval(timer);
                    obj.html("获取验证码");
                    obj.removeClass("isCountDown").removeClass("disable").addClass('enable');
                }
            }
            var timer = setInterval(CountDowning, 1000);
            CountDowning();
        };
        window.ccc = CountDown;
        /*
         *获取短信验证码
         *0 普通注册   sms_login=false
         *1 短信免注册 sms_login=true
         *2 找回密码 sms_login=false registered=true
         *3 第三方账号
         *4 绑定手机号 for_partner_bind_phone_number=force strategy for_bind_phone_number=true
         *callback: {"status":"200","message":"恭喜你，用户注册成功快去领红包吧","return_to":"http://ddd.dd.com/ddd/dd"}
         */
        function getCaptcha(type) {
            //console.log("getCaptcha ajax method start");
            var phone = $("#phone_number").val();
            //获取短信验证码打点统计
            $.tracklog.action("idcode",track_data,"{eventvalue:sms}");
            // $.tracklog.action("idcode",track_data,"{sms}");
            if (phone != '') {
                if (type == 0) {
                    //console.log("普通注册获取验证码");
                    $.ajax({
                        type: "get",
                        url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&sms_login=false&for_bind_phone_number=false&registered=false",
                        dataType: "jsonp",
                        jsonp: "callback",
                        success: function(data) {
                            console.log(data);
                            var _data = data;
                            if (typeof _data == "object") {
                                if (_data.status == 200 || _data.status == 201) {
                                    $.zheui.toast(_data.message);
                                    CountDown(60);
                                    //$('.djtphyz').remove();
                                } else if (_data.status == 400) {
                                    $.zheui.toast(_data.message);
                                    //window.location = 'http://h5.m.zhe800.com/login'
                                    // 如果发生错误，重置获取验证码按钮
                                    $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                                } else if (_data.status == 402) {
                                    // $.zheui.toast("请稍等....");
                                    Passport.renderSecurity();
                                } else {
                                    $.zheui.toast(_data.message);
                                    // 如果发生错误，重置获取验证码按钮
                                    $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                                }
                            }
                        },
                        timeout: 20000,
                        error: function() {
                            //console.log("网络异常");
                            $.zheui.toast("网络异常，请稍后再试.");
                            $("#confirm_security_button").text("提交");
                            // 如果发生错误，重置获取验证码按钮
                            $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                        }
                    });
                } else if (type == 1) {
                    //console.log("短信免注册获取验证码");
                    $.ajax({
                        type: "get",
                        url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                        //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                        dataType: "jsonp",
                        jsonp: "callback",
                        success: function(data) {

                            var _data = data,
                                status = _data.status;
                            console.log(status);

                            //用户不存在，直接登录
                            if (_data.status == 201) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', 'new');
                                $('.phone_section #phone_number').attr('name', 'phone_number');
                            } else if (_data.status == 202) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', '0');
                                $('.phone_section #phone_number').attr('name', 'user_name');
                            } else if (_data.status == 402) {
                                // $.zheui.toast("请稍等....");
                                Passport.renderSecurity();
                            } else if (_data.status == 400) {
                                $.zheui.toast(_data.message);
                                // Passport.renderSecurity();
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }else{
                                $.zheui.toast(_data.message);
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }
                        },
                        timeout: 20000,
                        error: function() {
                            console.log("网络异常");
                            $.zheui.toast("网络异常，请稍后再试.");
                            $("#confirm_security_button").text("提交");
                            // 如果发生错误，重置获取验证码按钮
                            $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                        }
                    });
                } else if (type == 2) {
                    //console.log("找回密码获取验证码");
                    // CountDown(60);
                    $.ajax({
                        type: "get",
                        url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&sms_login=false&registered=true",
                        //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                        dataType: "jsonp",
                        jsonp: "callback",
                        success: function(data) {
                            //console.log(data);
                            var _data = data;
                            //用户不存在，直接登录
                            if (_data.status == 201) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', 'new');
                                $('.phone_section #phone_number').attr('name', 'phone_number');
                            } else if (_data.status == 202) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', '0');
                                $('.phone_section #phone_number').attr('name', 'user_name');
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            } else if (_data.status == 402) {
                                Passport.renderSecurity();

                            } else if (_data.status == 400) {
                                $.zheui.toast(_data.message);
                                // Passport.renderSecurity();
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }else{
                                $.zheui.toast(_data.message);
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }
                        },
                        timeout: 20000,
                        error: function() {
                            console.log("网络异常");
                            $("#confirm_security_button").text("提交");
                            $.zheui.toast("网络异常，请稍后再试.");
                            // 如果发生错误，重置获取验证码按钮
                            $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                        }
                    });
                } else if (type == 3) {
                    //console.log("找回密码获取验证码");
                    // CountDown(60);
                    var pt = $.zheui.getUrlKeyVal("pt");
                    $.ajax({
                        type: "get",
                        url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&sms_login=false&registered=true&strategy="+pt,
                        //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                        dataType: "jsonp",
                        jsonp: "callback",
                        success: function(data) {
                            //console.log(data);
                            var _data = data;
                            //用户不存在，直接登录
                            if (_data.status == 201) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', 'new');
                                $('.phone_section #phone_number').attr('name', 'phone_number');
                            } else if (_data.status == 202) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', '0');
                                $('.phone_section #phone_number').attr('name', 'user_name');
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            } else if (_data.status == 402) {
                                Passport.renderSecurity();

                            } else if (_data.status == 400) {
                                $.zheui.toast(_data.message);
                                // Passport.renderSecurity();
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }else{
                                $.zheui.toast(_data.message);
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }
                        },
                        timeout: 20000,
                        error: function() {
                            console.log("网络异常");
                            $("#confirm_security_button").text("提交");
                            $.zheui.toast("网络异常，请稍后再试.");
                            // 如果发生错误，重置获取验证码按钮
                            $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                        }
                    });
                } else if (type == 4) {
                    //console.log("找回密码获取验证码");
                    // CountDown(60);
                    var pt = $.zheui.getUrlKeyVal("pt");
                    $.ajax({
                        type: "get",
                        url: "https://passport.zhe800.com/wap3/users/generate_phone_verify_code&phone_number=" + phone + "&for_partner_bind_phone_number=force&&sms_login=false&for_bind_phone_number=true&strategy="+pt,
                        //data: "phone_number=" + phone + "&sms_login=true&for_bind_phone_number=false&registered=false",
                        dataType: "jsonp",
                        jsonp: "callback",
                        success: function(data) {
                            //console.log(data);
                            var _data = data;
                            //用户不存在，直接登录
                            if (_data.status == 201) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', 'new');
                                $('.phone_section #phone_number').attr('name', 'phone_number');
                            } else if (_data.status == 202) {
                                $.zheui.toast(_data.message);
                                CountDown(60);
                                //$('.djtphyz').remove();
                                $('.btnSubmit').attr('auth', '0');
                                $('.phone_section #phone_number').attr('name', 'user_name');
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            } else if (_data.status == 402) {
                                Passport.renderSecurity();

                            } else if (_data.status == 400) {
                                $.zheui.toast(_data.message);
                                // Passport.renderSecurity();
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }else{
                                $.zheui.toast(_data.message);
                                // 如果发生错误，重置获取验证码按钮
                                $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                            }
                        },
                        timeout: 20000,
                        error: function() {
                            console.log("网络异常");
                            $("#confirm_security_button").text("提交");
                            $.zheui.toast("网络异常，请稍后再试.");
                            // 如果发生错误，重置获取验证码按钮
                            $("#getCaptcha").html("获取验证码").removeClass("isCountDown");
                        }
                    });
                }
            }
        };
        /*
         *url跳转，用于passport接口回调跳转
         */
        function directUrl() {
            //console.log("direct url method start");
            var url = $.zheui.getUrlKeyVal('return_to');
            (url != '') ? url = $.zheui.getUrlKeyVal('return_to') : url = "//m.zhe800.com";
            // var url = $.zheui.getUrlKeyVal('return_to')+'&vt=4&ampstatus=success';
            window.location.href = url;
        };
        /*
         *登陆
         *未注册用户，登陆后调用注册句柄
         *注册用户，登陆后跳转
         *callback: {"status":"200","message":"恭喜你，用户注册成功快去领红包吧","return_to":"http://ddd.dd.com/ddd/dd"}
         */
        function login(area) {
            if (area == 'account') {
                var data = getInputVal($(".account_section input"));
                $.tracklog.action("login", {
                    "s": "2"
                });
                // $.tracklog.action("login",track_data,"{eventvalue:password,}");
            }else if(area == 'phone') {
                var data = getInputVal($(".phone_section input"));
                $.tracklog.action("login", {
                    "s": "1"
                });
            };
            if (area == 'account') {

            }else{
                /**卫茹修改 添加token**/
                if($("#captcha_token").val() != ""){
                    data += "&validate_token="+$("#captcha_token").val();
                    data += "&step=2";
                    data += "&business_code="+$("#business_code").val();
                }
            }
                $.zheui.loadingbar("show", "请求中，请稍后...");
                console.log("login data", data);
                $.ajax({
                    type: "get",
                    url: "https://passport.zhe800.com/wap3/session?" + data + "",
                    dataType: "jsonp",
                    jsonp: "callback",
                    beforeSend: function() {
                        $('.btnSubmit').text("正在登录...");
                    },
                    success: function(data) {
                        var _data = data;
                        var login_type = label.login_type;
                        console.log(_data);
                        if (typeof _data == "object") {
                            $('.btnSubmit').text("登录");
                            $.zheui.loadingbar("hide", "请求中，请稍后...");
                            if (_data.status == 200) {
                                $.zheui.toast(_data.message);
                                directUrl();
                                if(area == "account"){
                                    //账号密码方式登陆成功打点统计
                                    $.tracklog.action("login",track_data,"{eventvalue:password,eventtype:1}");
                                }else{
                                    //短信方式登陆成功打点统计
                                    $.tracklog.action("login",track_data,"{eventvalue:"+login_type+",eventtype:1}");
                                }
                            } else if (_data.status == 402) {
                                if(area == "account"){
                                    //短信方式登陆失败打点统计
                                    $.tracklog.action("login",track_data,"{eventvalue:password,eventtype:0}");
                                }
                                else{
                                    //账号密码方式登陆失败打点统计
                                    $.tracklog.action("login",track_data,"{eventvalue:"+login_type+",eventtype:0}");
                                }
                                /**卫茹修改***/
                                $('.btnSubmit').attr('auth', '0');
                                $('.phone_section #phone_number').attr('name', 'phone_number');
                                register(1);
                            } else {
                                if(area == "account"){
                                    //短信方式登陆失败打点统计
                                    $.tracklog.action("login",track_data,"{eventvalue:password,eventtype:0}");
                                }
                                else{
                                    //账号密码方式登陆失败打点统计
                                    $.tracklog.action("login",track_data,"{eventvalue:"+login_type+",eventtype:0}");
                                }
                                $.zheui.toast(_data.message);
                                if (_data.need_captcha == true) {
                                    needCaptcha();
                                    return false;
                                }
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        if(area == "account"){
                            //短信方式登陆失败打点统计
                            $.tracklog.action("login",track_data,"{eventvalue:password,eventtype:0}");
                        }
                        else{
                            //账号密码方式登陆失败打点统计
                            $.tracklog.action("login",track_data,"{eventvalue:sms,eventtype:0}");
                        }
                        console.log("网络异常");
                        $('.btnSubmit').text("提交");
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        $.zheui.toast("网络异常，请稍后再试.");
                    }
                });
        };
        function needCaptcha() {
        	//console.log("needCaptcha method start");
        	$.ajax({
        		url: "https://acode.tuanimg.com/captcha/get_image?jsonp=1",
        		dataType: 'jsonp',
        		type: 'get',
        		data: { _: new Date().getTime() },
        		success: function (data) {
        			var _data = data;
        			//console.log(_data.message);
        			if (typeof _data == "object") {
        				$('.btnSubmit').text("登录");
        				$.zheui.loadingbar("hide", "请求中，请稍后...");
        				$.zheui.toast(_data.message);
        				if (_data.url != '' && _data.keywords != '') {
        					if ($('#captcha').length == 0) {
        						$('.account_section').find('p').eq(2).after("<p class='login_input login_input_name pos_r'><input id='captcha' name='captcha' placeholder='验证码' type='text' msg='验证码不能为空' reg='(^\s*)|(\s*$)'><image class='fr e_change_captcha_normal' src='" + _data.url + "'></p><p class='pos_r djtphyz' style='color:#9d9d9d; fontSize:9px; text-align:right; margin:0 3%; border-top:none; border-bottom:none;'>点击图片换一张</p>");
        						$('.account_section div').append('<p><input type="hidden" id="captcha_keywords" name="captcha_keywords" value="' + _data.keywords + '"></p>');
        					    $.zheui.bindTouchGoto($(".e_change_captcha_normal"), function(_this) {
                                    Passport.changeCaptchaN();
                                });
                            } else {
        						$('.account_section').find('#captcha').next('img').attr('src', _data.url);
        						$('.account_section div').find('#captcha_keywords').val(_data.keywords);
        					}

        				}
        			}
        		}
        	});
        }
        /*
         *注册
         *type 0 正常注册
         *type 1 快速注册
         *callback: {"status":"200","message":"恭喜你，用户注册成功快去领红包吧","return_to":"http://ddd.dd.com/ddd/dd"}
         */
        function register(type) {
            $.zheui.loadingbar("show", "请求中，请稍后...");
            var data = getInputVal($(".reg_box input"));
            /**卫茹修改 添加token**/
            if($("#captcha_token").val() != ""){
                data += "&validate_token="+$("#captcha_token").val();
                data += "&step=2";
                data += "&business_code="+$("#business_code").val();
            }
            if (type == 0) {
                $.ajax({
                    type: "get",
                    url: "https://passport.zhe800.com/wap3/users/create?is_login=true",
                    data: data,
                    dataType: "jsonp",
                    jsonp: "callback",
                    beforeSend: function() {
                        $('.btnSubmit').text("正在提交...");
                    },
                    success: function(data) {
                        //console.log(data);
                        var _data = data;
                        if (typeof _data == "object") {
                            $('.btnSubmit').text("提交");
                            $.zheui.loadingbar("hide", "请求中，请稍后...");
                            $.zheui.toast(_data.message);
                            if (_data.status == 200) {
                                directUrl();
                                //注册成功打点统计
                                $.tracklog.action("register",track_data,"{eventtype:1}");
                            }
                            else{
                                //注册失败打点统计
                                $.tracklog.action("register",track_data,"{eventtype:0}");
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        console.log("网络异常");
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        $.zheui.toast("网络异常，请稍后再试.");
                        //注册失败打点统计
                        $.tracklog.action("register",track_data,"{eventtype:0}");
                    }
                });
            } else if (type == 1) {
                $.ajax({
                    type: "get",
                    url: "https://passport.zhe800.com/wap3/users/fast_create?is_login=true&source=normal",
                    data: data,
                    dataType: "jsonp",
                    jsonp: "callback",
                    beforeSend: function() {
                        $('.btnSubmit').text("正在提交...");
                    },
                    success: function(data) {
                        //console.log(data);
                        var _data = data;
                        if (typeof _data == "object") {
                            $('.btnSubmit').text("提交");
                            $.zheui.loadingbar("hide", "请求中，请稍后...");
                            $.zheui.toast(_data.message);
                            if (_data.status == 200) {
                                directUrl();
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        //console.log("网络异常");
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        $.zheui.toast("网络异常，请稍后再试.");
                    }
                });
            }
        };
        /*
         *找回密码
         *callback: {"status":"200","message":"恭喜你，用户注册成功快去领红包吧","return_to":"http://ddd.dd.com/ddd/dd"}
         */
        function findPwd() {
            $.zheui.loadingbar("show", "请求中，请稍后...");
            var data = getInputVal($(".reg_box input"));
            /**卫茹修改 添加token**/
            if($("#captcha_token").val() != ""){
                data += "&validate_token=" + $("#captcha_token").val();
                data += "&step=2";
                data += "&business_code="+$("#business_code").val();
            }
            $.ajax({
                type: "get",
                url: "https://passport.zhe800.com/wap3/passwords/find?",
                data: data,
                dataType: "jsonp",
                jsonp: "callback",
                beforeSend: function() {
                    $('.btnSubmit').text("正在提交...");
                },
                success: function(data) {
                    //console.log(data);
                    var _data = data;
                    if (typeof _data == "object") {
                        $('.btnSubmit').text("提交");
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        if (_data.status == 200) {
                            $.zheui.toast("修改成功，请重新登录");
                            setTimeout("$.zheui.directUrl()", 2000);
                            //找回密码成功打点统计
                            $.tracklog.action("findpassword",track_data,"{eventtype:1}");
                        } else {
                            $.zheui.toast(_data.message);
                            //找回密码失败打点统计
                            $.tracklog.action("findpassword",track_data,"{eventtype:0}");
                        }
                    }
                },
                timeout: 20000,
                error: function() {
                    $('.btnSubmit').text("提交");
                    //console.log("网络异常");
                    $.zheui.loadingbar("hide", "请求中，请稍后...");
                    $.zheui.toast("网络异常，请稍后再试.");
                    //找回密码失败打点统计
                    $.tracklog.action("findpassword",track_data,"{eventtype:0}");
                }
            });
        };
        /*
         *修改密码
         *callback: {"status":"200","message":"恭喜你，用户注册成功快去领红包吧","return_to":"http://ddd.dd.com/ddd/dd"}
         */
        function changePwd() {
            $.zheui.loadingbar("show", "请求中，请稍后...");
            $.ajax({
                type: "get",
                url: "https://passport.zhe800.com/wap3/passwords/update?",
                data: getInputVal($(".reg_box input")),
                dataType: "jsonp",
                jsonp: "callback",
                beforeSend: function() {
                    $('.btnSubmit').text("正在提交...");
                },
                success: function(data) {
                    console.log(data);
                    var _data = data;
                    if (typeof _data == "object") {
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        $('.btnSubmit').text("提交");
                        if (_data.status == 200) {
                            $.zheui.toast("修改成功，请重新登录");
                            setTimeout("$.zheui.directUrl()", 2000);
                        } else {
                            $.zheui.toast(_data.message);
                        }
                    }
                },
                timeout: 20000,
                error: function() {
                    $('.btnSubmit').text("提交");
                    console.log("网络异常");
                    $.zheui.loadingbar("hide", "请求中，请稍后...");
                    $.zheui.toast("网络异常，请稍后再试.");
                }
            });
        };

        /**卫茹修改 添加区分source_type的函数**/
        function getSourceType(type){
            if(type == "0"){
                //var source_type = "user_register_wap";
                var source_type = 15;
            }else if(type == "1"){
                //var source_type = "fast_user_register_wap";
                var source_type = 16;
            }else if(type == "2"){
                //var source_type = "password_find_wap";
                var source_type = 17;
            }else if(type == "3"){
                //var source_type = "bindphone";
                var source_type = 11;
            }
            return source_type;
        }

        $(document).on("keyup", ".login_input input", function() {
            if ($(this).val() != '') {
                if ($(this).attr('type') == 'password') {
                    $(this).next().next().removeClass('hide');
                    if ($(this).val != '') {
                        $(this).parents('p').next('.tip').removeClass('hide');
                    } else {
                        $(this).parents('p').next('.tip').addClass('hide');
                    }
                } else {
                    if ($(this).attr('id') == 'captcha') {
                        return false;
                    } else {
                        $(this).next().addClass('hide');
                    }
                }
            };
        });

        //输入框，聚焦，显示清空按钮
        $(document).on("focus", ".login_input input", function() {
            if ($(this).val() != '') {
                $(this).next().removeClass('hide');
            } else {

            }
            if ($(this).attr('type') == 'password') {
                //$(this).next().removeClass('hide');
                $(this).next().next().removeClass('hide');
                $(this).parents('p').next('.tip').removeClass('hide');
            } else {
                // $(this).next().removeClass('hide');
            };
        });

        //输入框，离焦，隐藏清空按钮
        $(document).on("blur", ".login_input input", function() {
            if ($(this).attr('type') == 'password') {
                $(this).next().addClass('hide');
                $(this).next().next().addClass('hide');
                $(this).parents('p').next('.tip').addClass('hide');
            } else {
                if ($(this).attr('id') == 'captcha') {
                    return false;
                } else {
                    $(this).next().addClass('hide');
                }
            }
        });

        $(document).on("keyup", ".login_input input", function() {
            if ($(this).val() != '') {
                var regarr = $(this).attr("reg").split("#"),
                    msgarr = $(this).attr("msg").split("#"),
                    re = new RegExp(regarr);
                //console.log(regarr);
                if ($('.phone_section').hasClass('hide') == false && $('.account_section').hasClass('hide') == true) {
                    var area = 'phone';
                } else if ($('.phone_section').hasClass('hide') == true && $('.account_section').hasClass('hide') == false) {
                    var area = 'account';
                } else if ($('.phone_section').hasClass('hide') == false && $('.account_section').hasClass('hide') == false) {
                    var area = 'normal';
                }
                if (re.test($(this).val()) == true) {
                    if ($(this).attr('type') == 'password') {
                        $(this).next().next().removeClass('hide');
                        $(this).parents('p').next('.tip').removeClass('hide');
                    }/**卫茹修改  验证码状态**/
                    else if (this.id === 'phone_number') {
                        if(!$('#getCaptcha').hasClass('isCountDown')){
                            $('#getCaptcha').removeClass('disable').addClass('enable');
                        }
                        if(!$('#voiceCaptcha').hasClass('isCountDown')){
                            $('#voiceCaptcha').removeClass('disable').addClass('enable');
                        }
                    }
                    $(this).next().removeClass('hide');
                    //$(this).attr("adjust", true);
                    //adjustInput(area);
                } else {
                    if ($(this).attr('type') == 'password') {
                        $(this).next().next().removeClass('hide');
                    }/**卫茹修改  验证码状态**/
                    else if (this.id === 'phone_number') {
                        $('#getCaptcha').removeClass('enable').addClass('disable');
                        $('#voiceCaptcha').removeClass('enable').addClass('disable');
                    }
                    $(this).next().removeClass('hide');
                }
            } else {
                if ($(this).attr('id') == 'captcha') {
                    return false;
                } else {
                    $(this).next().addClass('hide');
                }
                if ($(this).attr('type') == 'password') {
                    $(this).next().next().addClass('hide');
                    $(this).parents('p').next('.tip').addClass('hide');
                };
                //$(this).attr("adjust", false);
                // $('.btnSubmit').removeClass('enable').addClass('disable');
            }

        });

        function adjustInput(area) {
            if (area == 'phone') {
                for (var i = 0; i < $('.phone_section input').length - 1; i++) {
                    if ($('.phone_section input').length > 3) {
                        for (var j = $('.phone_section input').length / 2; j < $('.phone_section input').length; j++) {
                            if ($('.phone_section input').eq(i).attr('adjust') == 'true' && $('.phone_section input').eq(j).attr('adjust') == 'true' && $('.phone_section input').eq(i).attr('adjust') == $('.phone_section input').eq(j).attr('adjust')) {
                                $('.phone_section .btnSubmit').removeClass('disable').addClass('enable');
                            } else if ($('.phone_section input').eq(i).attr('adjust') == 'false') {
                                $('.phone_section .btnSubmit').removeClass('enable').addClass('disable');
                            }
                        }
                    } else {
                        for (var j = 1; j < $('.phone_section input').length; j++) {
                            if ($('.phone_section input').eq(i).attr('adjust') == 'true' && $('.phone_section input').eq(j).attr('adjust') == 'true' && $('.phone_section input').eq(i).attr('adjust') == $('.phone_section input').eq(j).attr('adjust')) {
                                $('.phone_section .btnSubmit').removeClass('disable').addClass('enable');
                            } else if ($('.phone_section input').eq(i).attr('adjust') == 'false') {
                                $('.phone_section .btnSubmit').removeClass('enable').addClass('disable');
                            }
                        }
                    }

                }
            } else if (area == 'account') {
                for (var i = 0; i < $('.account_section input').length - 1; i++) {
                    if ($('.account_section input').length > 3) {
                        for (var j = $('.account_section input').length / 2; j < $('.account_section input').length; j++) {
                            if ($('.account_section input').eq(i).attr('adjust') == 'true' && $('.account_section input').eq(j).attr('adjust') == 'true' && $('.account_section input').eq(i).attr('adjust') == $('.account_section input').eq(j).attr('adjust')) {
                                $('.account_section .btnSubmit').removeClass('disable').addClass('enable');
                            } else if ($('.account_section input').eq(i).attr('adjust') == 'false') {
                                $('.account_section .btnSubmit').removeClass('enable').addClass('disable');
                            }
                        }
                    } else {
                        for (var j = 1; j < $('.account_section input').length; j++) {
                            if ($('.account_section input').eq(i).attr('adjust') == 'true' && $('.account_section input').eq(j).attr('adjust') == 'true' && $('.account_section input').eq(i).attr('adjust') == $('.account_section input').eq(j).attr('adjust')) {
                                $('.account_section .btnSubmit').removeClass('disable').addClass('enable');
                            } else if ($('.account_section input').eq(i).attr('adjust') == 'false') {
                                $('.account_section .btnSubmit').removeClass('enable').addClass('disable');
                            }
                        }
                    }

                }
            } else {
                for (var i = 0; i < $('.reg_box input').length; i++) {
                    for (var j = $('.reg_box input').length / 2; j < $('.reg_box input').length; j++) {
                        if ($('.reg_box input').eq(i).attr('adjust') == 'true' && $('.reg_box input').eq(j).attr('adjust') == 'true' && $('.reg_box input').eq(i).attr('adjust') == $('.reg_box input').eq(j).attr('adjust')) {
                            $('.btnSubmit').removeClass('disable').addClass('enable');
                        } else if ($('.reg_box input').eq(i).attr('adjust') == 'false') {
                            $('.btnSubmit').removeClass('enable').addClass('disable');
                        }
                    }
                }
            }
            for (var i = 0; i < $('.reg_box input').length; i++) {
                for (var j = $('.reg_box input').length / 2; j < $('.reg_box input').length; j++) {
                    if ($('.reg_box input').eq(i).attr('adjust') == 'true' && $('.reg_box input').eq(j).attr('adjust') == 'true' && $('.reg_box input').eq(i).attr('adjust') == $('.reg_box input').eq(j).attr('adjust')) {
                        $('.btnSubmit').removeClass('disable').addClass('enable');
                    } else if ($('.reg_box input').eq(i).attr('adjust') == 'false') {
                        $('.btnSubmit').removeClass('enable').addClass('disable');
                    }
                }
            }
        };


        $(document).on("click", ".clearInput", function() {
            _this.prev('input').val('');
            var ele = _this.prev('input');
            if (_this.prev('input').attr('type') == 'passowrd') {
                _this.next('.tip').addClass('hide');
            };
        });



        //清空输入框方法
        $.zheui.bindTouchGoto($(".clearInput"), function(_this) {
            //alert(_this.prev().val());
            _this.prev('input').val('');
            var ele = _this.prev('input');
            if (_this.prev('input').attr('type') == 'passowrd') {
                _this.next('.tip').addClass('hide');
            };
            /**卫茹修改  验证码状态**/
            if(_this.prev('input').attr('id') == 'phone_number'){
                if ($('#getCaptcha').hasClass('enable')) {
                    $('#getCaptcha').removeClass('enable').addClass('disable');
                    $('#voiceCaptcha').removeClass('enable').addClass('disable');
                    $('.btnSubmit').attr('auth', '');
                }
            }
            //输入框，聚焦，显示清空按钮
            ele.trigger('keyup');
        });


        //获取验证码
        $.zheui.bindTouchGoto($("#getCaptcha"), function(_this) {
            var key = _this.attr('key');
            console.log("get auth code start");
            if (_this.hasClass("enable")) {
                if ($('#getCaptcha').hasClass("isCountDown") == false) {
                    label.login_type="sms";
                    getCaptcha(key);
                }
            }
        });

        /**卫茹修改   语音验证码**/
        var VoiceCaptcha = {
            CountDown:function(num){
                var num = num;
                $("#voiceCaptcha").addClass("isCountDown");
                $("#voiceCaptcha").removeClass("enable").addClass("disable");
                $("#voiceCaptcha").html("语音验证码(<span id='num' style='color: red;display: inline;margin: 0%'></span>)s");
                //$("#voiceCaptcha").appendChild("<p id='num' style='color: red'></p>");
                var obj = $("#num");
                var CountDowning = function() {
                    if (num >= 0) {
                        obj.html(num);
                        --num;
                    } else {
                        clearInterval(timer);
                        $("#voiceCaptcha").html("语音验证码");
                        $("#voiceCaptcha").removeClass("isCountDown");
                        $("#voiceCaptcha").removeClass("disable").addClass("enable");
                    }
                }
                var timer = setInterval(CountDowning, 1000);
            },
            //请求语音验证码
            getVoiceCaptcha:function(phoneNumber,type){
                //获取语音验证码打点统计
                $.tracklog.action("idcode",track_data,"{eventvalue:phone}");
                // $.tracklog.action("idcode",track_data,"{phone}");
                var token = $("#captcha_token").val();
                //validate_type：
                // 4：短信验证码，
                // 5：语音验证码
                 var strategy = $.zheui.getUrlKeyVal('strategy');
                if(type == 3){
                    var business_params = {phone_number: phoneNumber,strategy:strategy};
                }else{
                    var business_params = {phone_number: phoneNumber};
                }
                
                var validate_type = 5;
                business_params = JSON.stringify(business_params);
                //var additions = {phone_number:phoneNumber,validate_type:5};
                //additions = JSON.stringify(additions);
                var business_code = $("#business_code").val();
                var source_type = getSourceType(type);
                
                $.ajax({
                    type:"get",
                    url:"https://acode.zhe800.com/t/bundle_verify/token?source_type="+source_type+"&step=2&validate_token=" +token +"&phone_number="+phoneNumber+"&validate_type="+validate_type+"&business_params="+business_params+"&business_code="+business_code+"&strategy="+strategy,
                    //url:"https://acode.zhe800.com/t/bundle_verify/token?source_type="+source_type+"&step=2&validate_token=" +token +"&additions="+additions+"&business_code="+business_code,
                    dataType:"jsonp",
                    jsonp:"callback",
                    success:function(data){
                        //请求正常
                        if(data.status == 1){
                            if(data.validate_token != ""){
                                //console.log(user_states);
                                if(type == "1"){
                                    // var user_states = JSON.parse(data.msg).user_state;
                                    var user_states = data.msg.user_state;
                                    if(user_states == 1){
                                        $('.btnSubmit').attr('auth', 'new');
                                    }else if(user_states == 0){
                                        $('.btnSubmit').attr('auth', '0');
                                    }
                                }
                                $("#captcha_token").val(data.validate_token);
                                $.zheui.toast("电话拨打中，请注意来电");
                                VoiceCaptcha.CountDown(60);
                            }
                        }//请求异常
                        else if(data.status == 0){
                            if(data.failure_code == 999){
                                // $.zheui.toast(JSON.parse(data.msg).error_content);

                                $.zheui.toast(data.msg.error_content);
                            }else{
                                if(data.failure_code == 7){
                                    $.zheui.toast("请求频率过快，请稍后请求");
                                }else if(data.failure_code == 8){
                                    $.zheui.toast("请求次数已超出限制，请求拒绝");
                                }else{
                                    $.zheui.toast("电话拨打失败，请尝试其他登录方式");
                                }
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        //console.log("网络异常");
                        $.zheui.toast("网络异常，请稍后再试.");
                        $("#confirm_security_button").text("提交");
                    }
                })
            },

            //验证图片验证码
            checkCaptcha:function(type){
                var token = $(".pop_voiceCaptcha").find("#captcha_token").val();
                var content = $(".pop_voiceCaptcha").find("#captcha").val();
                var business_code = $("#business_code").val();
                $.ajax({
                   type:"get",
                   url:"https://acode.zhe800.com/t/bundle_verify/validate?validate_token=" + token +"&content=" + content + "&step=1"+"&business_code="+business_code,
                   dataType:"jsonp",
                   jsonp:"callback",
                   success:function(_data){
                        console.log(typeof(_data));
                        console.log(_data.status);
                       //验证成功
                       if(_data.status == 1){
                               mydialog.hide();
                               $(".breadcrumb_login a").css("opacity",1);
                               //普通注册
                               if(type == 0){
                                   var phoneNumber = $(".reg_box").find("#phone_number").val();
                               }//手机登陆
                               else if(type == 1){
                                   var phoneNumber = $(".phone_section").find("#phone_number").val();
                               }//找回密码
                               else if(type == 2){
                                   var phoneNumber = $(".reg_box").find("#phone_number").val();
                               } else if(type == 3){
                                   var phoneNumber = $(".reg_box").find("#phone_number").val();
                               }
                               VoiceCaptcha.getVoiceCaptcha(phoneNumber,type);
                       }else if(_data.status == 0){
                           $("#confirm_security_button").text("提交");
                           $.zheui.toast("验证码输入错误");
                           VoiceCaptcha.changeCaptcha(type);
                       }
                   },
                    timeout: 20000,
                    error: function() {
                        //console.log("网络异常");
                        $.zheui.toast("网络异常，请稍后再试.");
                        $("#confirm_security_button").text("提交");
                    }
                });
            },
            //添加图片验证码
            needCaptcha:function(type){
                var business_code = new Date().getTime();
                business_code = business_code.toString() + $("#phone_number").val();
                business_code = business_code.substring(0,15);
                var source_type = getSourceType(type);
                $.ajax({
                  type:"get",
                  url:"https://acode.zhe800.com/t/bundle_verify/token?step=1&source_type="+source_type+"&business_code="+business_code,
                  dataType:"jsonp",
                  jsonp:"callback",
                  success:function(data){
                    var _data = data;
                      //请求正常
                    if(_data.status == 1){
                        /**validate_type:1:极验验证,2:图片验证,3:非用户操作验证，4是短信验证，5是语音验证***/
                      if(_data.validate_type == 2){
                          if(_data.validate_token != '' && _data.validate_adds.image_url != ''){
                              var keywords = $("#captcha_keywords").val() || '';
                              var htmlStr = "<div class='login pop_voiceCaptcha' style='margin:0;padding:0;display:inline'>";
                              htmlStr +="<button type='button' class='pos_r captcha_close' id='btn_close'></button>"
                              htmlStr += "<p class='pos_r captcha_area captcha_title'>为保证安全，请先提交图片验证码</p><p class='login_input login_input_name pos_r captcha_area' style='border:none;'><input id='captcha' name='captcha' placeholder='图片验证码' type='text' msg='验证码不能为空' reg='(^\s*)|(\s*$)' style='border: solid 1px #d5d5d5;border-radius: 3px'><image id='e_change_captcha' class='fr' src='" + _data.validate_adds.image_url + "'></p><p class='pos_r djtphyz' style='color:#9d9d9d; fontSize:9px; text-align:right; margin:0 3%; border-top:none; border-bottom:none;'>点击图片换一张</p><p class='pos_r captcha_area captcha_button'><button id='confirm_security_button'>提交</button></p>";
                              htmlStr +="<p class='captcha_area'><input type='hidden' id='captcha_token' name='captcha_token' value='" + _data.validate_token + "'></p>";
                              htmlStr +="<p class='captcha_area'><input type='hidden' id='business_code' name='business_code' value='" + business_code + "'></p>";
                              htmlStr +="<p class='captcha_area'><input type='hidden' id='captcha_keywords' name='captcha_keywords' value='" + _data.keywords + "'></p>";
                              htmlStr +="</div>";
                              mydialog.create("2",htmlStr);
                              $(".pop_voiceCaptcha").find("#captcha_keywords").val(keywords);
                              $(".breadcrumb_login a").css("opacity",0);
                              $.zheui.bindTouchGoto($(".pop_voiceCaptcha").find("#btn_close"),function(_this){
                                  mydialog.hide();
                                  $(".breadcrumb_login a").css("opacity",1);
                              });
                              $.zheui.bindTouchGoto($(".pop_voiceCaptcha").find("#confirm_security_button"), function(_this) {
                                  var key = $("#voiceCaptcha").attr('key');
                                  if ($(".pop_voiceCaptcha").find("#captcha").val() != '') {
                                      if ($('#voiceCaptcha').hasClass('enable')) {
                                          if ($('#voiceCaptcha').hasClass("isCountDown") == false) {
                                              _this.text("提交中...");
                                              VoiceCaptcha.checkCaptcha(key);
                                          }
                                      }
                                  } else {
                                      $.zheui.toast("请输入图片验证码");
                                  }
                              });
                              $.zheui.bindTouchGoto($(".pop_voiceCaptcha").find("#e_change_captcha"), function(_this) {
                                  VoiceCaptcha.changeCaptcha(type);
                              });
                          }

                      }
                    }
                    //请求异常
                    else{
                        // $.zheui.toast(JSON.parse(_data.msg).error_content);
                        $.zheui.toast(data.msg.error_content);
                    }
                  },
                  timeout: 20000,
                  error: function() {
                        //console.log("网络异常");
                      $.zheui.toast("网络异常，请稍后再试.");
                      $("#confirm_security_button").text("提交");
                    }
                });
            },
            changeCaptcha:function(type){
                var token = $("#captcha_token").val();
                var business_code = $("#business_code").val();
                var source_type = getSourceType(type)
                $.ajax({
                    url:"https://acode.zhe800.com/t/bundle_verify/token?step=1&source_type="+source_type+"&validate_token="+token+"&business_code="+business_code,
                    dataType:"jsonp",
                    jsonp:"callback",
                    success:function(_data){
                        if(typeof  _data == "object"){
                            if(_data.validate_token != '' && _data.validate_adds.image_url != ''){
                                $(".pop_voiceCaptcha").find("#e_change_captcha").attr("src",_data.validate_adds.image_url);
                                $(".pop_voiceCaptcha").find("#captcha_token").val(_data.validate_token);
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        //console.log("网络异常");
                        $.zheui.toast("网络异常，请稍后再试.");
                        $("#confirm_security_button").text("提交");
                    }
                });
            }
        };

        /**卫茹修改 语音验证码点击事件**/
         $.zheui.bindTouchGoto($("#voiceCaptcha"), function(_this) {
            var key = $("#voiceCaptcha").attr('key');
            if ($("#voiceCaptcha").hasClass("enable")) {
                if($("#voiceCaptcha").hasClass("isCountDown") == false){
                    //请求图片验证码
                    var key = $("#voiceCaptcha").attr("key");
                    label.login_type="phone";
                    VoiceCaptcha.needCaptcha(key);
                    // $.tracklog.action("idcode");
                }
            }
        });

        //注册协议绑定选择事件
        $.zheui.bindTouchGoto($(".zhe800_xy i"), function(_this) {
            if (_this.parent().hasClass("no")) {
                $(".zhe800_xy").removeClass("no");
                _this.next("input").val("true");
            } else {
                $(".zhe800_xy").addClass("no");
                _this.next("input").val("false");
            }
        });

        /*
         *提交表单
         *phone 手机登陆
         *account 账号登陆
         *changPwd 修改密码
         *findPwd 找回密码
         *register 注册
         *bindPhone 第三方账户绑定
         */
        $.zheui.bindTouchGoto($(".btnSubmit"), function(_this) {
            //console.log("submit method start");
            var key = _this.attr('type'),
                auth = _this.attr('auth');
            if (_this.hasClass('enable')) {
                if (key == 'changePwd') {
                    changePwd();
                } else if (key == 'account') {
                    if (checkInput($(".account_section input"))) {
                        $('.phone_section #phone_number').attr('name', 'user_name');
                        login('account');
                    };
                } else if (key == 'phone' && auth == undefined) {
                    //用户获取了验证码，关闭页面，3分钟后在来打开，默认行为为登陆
                    if (checkInput($(".phone_section input"))) {
                        $('.phone_section #phone_number').attr('name', 'user_name');
                        login('phone');
                        //return false;
                    };
                } else if (key == 'phone' && auth == '') {
                    //用户获取了验证码，关闭页面，3分钟后在来打开，默认行为为登陆
                    if (checkInput($(".phone_section input"))) {
                        $('.phone_section #phone_number').attr('name', 'user_name');
                        login('phone');
                    };
                } else if (key == 'phone' && auth == '0') {
                    //获取用户为已注册用户，直接登陆
                    if (checkInput($(".phone_section input"))) {
                        $('.phone_section #phone_number').attr('name', 'user_name');
                        login('phone');
                    };
                } else if (key == 'phone' && auth == 'new') {
                    //获取用户为未注册用户，直接注册
                    if (checkInput($(".phone_section input"))) {
                        register(1);
                    };
                } else if (key == 'findPwd') {
                    if (checkInput($(".reg_box input"))) {
                        findPwd();
                    };
                } else if (key == 'register') {
                    if (checkInput($(".reg_box input"))) {
                        register(0);
                    };
                } else if (key == 'bindPhone') {
                    if (checkInput($(".reg_box input"))) {
                        Passport.bindPhone();
                    };
                };;
            };
        });

        $.zheui.bindTouchGoto($(".trans_direction"), function(_this) {
            var url = $.zheui.getUrlKeyVal('return_to'),
                platfrom = $.zheui.getUrlKeyVal('pub_page_from')?$.zheui.getUrlKeyVal('pub_page_from'):"normal",
                key = _this.attr('site');
            if(platfrom == 'zheclient'){
                var platfrom = "cllent";
            }else{
               var platfrom = "normal";
            }
            if (key == 'register') {
                (url != '') ? url = $.zheui.getUrlKeyVal('return_to') : url = decodeURIComponent("//m.zhe800.com");
                window.location.href = "//m.zhe800.com/register?return_to=" + url;
                //快速注册打点统计
                $.tracklog.action("toregister",track_data,"");
            } else if (key == "findPwd") {
                (url != '') ? url = $.zheui.getUrlKeyVal('return_to') : url = decodeURIComponent("//m.zhe800.com");
                window.location.href = "//m.zhe800.com/findPwd?return_to=" + url;
                //忘记密码打点统计
                $.tracklog.action("findpassword",track_data,"");
            } else if (key == "thirdWeibo") {
                (url != '') ? url = encodeURIComponent($.zheui.getUrlKeyVal('return_to')) : url = decodeURIComponent($.zheui.domain);
                var encodeUrl = $.zheui.domain + "/login_callback?return_to=" + url + "&vt=4&";
                var thirdDirectUrl = encodeURIComponent(encodeUrl);
                // alert(thirdDirectUrl);
                
                // console.log("http://passport.tuan800.com/sso/partner_login/weibo?callback_url=" + thirdDirectUrl + "amp;domain=zhe800.com&amp;view=wap;platform="+platfrom+"");
                window.location.href = "http://passport.tuan800.com/sso/partner_login/weibo?callback_url=" + thirdDirectUrl + "amp;domain=zhe800.com&amp;view=wap;platform="+platfrom;
                //第三方微博登录打点统计
                $.tracklog.action("login",track_data,"{eventtype:weibo,eventtype:1}");
            } else if (key == "thirdQq") {
                (url != '') ? url = encodeURIComponent($.zheui.getUrlKeyVal('return_to')) : url = decodeURIComponent($.zheui.domain);
                var encodeUrl = $.zheui.domain + "/login_callback?return_to=" + url + "&vt=4&";
                var thirdDirectUrl = encodeURIComponent(encodeUrl);
                window.location.href = "http://passport.tuan800.com/sso/partner_login/qq_connect?callback_url=" + thirdDirectUrl + "amp;domain=zhe800.com&amp;view=wap;platform="+platfrom;
                //第三方QQ登录打点统计
                $.tracklog.action("login",track_data,"{eventtype:qq,eventtype:1}");
            }
        });

        $.zheui.bindTouchGoto($(".tab a"), function(_this) {
            var id = _this.attr('id');
            if (id == 'phone') {
                $('.item_phone').addClass('active');
                $('.item_account').removeClass('active');
                $('.phone_section').removeClass('hide');
                $('.account_section').addClass('hide');
                $('.other_login').addClass('hide');
            } else if (id == 'account') {
                $('.item_phone').removeClass('active');
                $('.item_account').addClass('active');
                $('.account_section').removeClass('hide');
                $('.phone_section').addClass('hide');
                $('.other_login').removeClass('hide');
            }

        });


        $.zheui.bindTouchGoto($(".pass2text_btn"), function(_this) {
            var type = _this.prev().prev().attr('type');
            $.tracklog.action("loginclick", {
                "s": 1
            });
            if (type == 'password') {
                _this.prev().prev().attr('type', 'text');
                _this.removeClass('showText').addClass('showPass');
            } else if (type == 'text') {
                _this.prev().prev().attr('type', 'password');
                _this.removeClass('showPass').addClass('showText');
            }
        });


        Passport.adapt();
    });