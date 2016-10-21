define(function (require, exports, module) {

    var $ = require("zepto");
    require("../common/base");

    //检查用户输入
    function checkInput(arr){
        var ischeck=true;
        arr.each(function(){
            var regstr=$(this).attr("reg");
            var _val  = $(this).val().replace(/[\s]/g,'');
            if(regstr){
                var regarr = regstr.split("#");
                var msgarr = $(this).attr("msg").split("#");
                for(var i=0;i<regarr.length;i++){
                    var re=new RegExp(regarr[i]);
                    if(!re.test(_val)){
                        $.zheui.toast(msgarr[i]);
                        ischeck=false;
                        return false;
                    }
                }
            }else{
                var msgstr=$(this).attr("msg");
                if(msgstr){
                    if(_val==''){
                        $.zheui.toast(msgstr);
                        ischeck=false;
                        return false;
                    }else if($(this).attr("type")=="password"){
                        var passval = $("#password").val();
                        if(passval!=$(this).val()){
                            $.zheui.toast("输入的密码不一致");
                            ischeck=false;
                            return false;
                        }
                    }
                }
            }
            if($(".zhe800_xy").hasClass("no")){
                $.zheui.toast("请选择同意折800注册协议");
                ischeck=false;
                return false;
            }
        });
        return ischeck;
    }

    //注册协议绑定选择事件
    $.zheui.bindTouchGoto($(".zhe800_xy"), function(_this){
        if(_this.hasClass("no")){
            _this.removeClass("no");
            _this.find("input").val("true");
        }else{
            _this.addClass("no");
            _this.find("input").val("false");
        }
    });

    //获取用户输入的内容
    var getInputVal=function(arr){
        var vals = '';
        $(arr).each(function(){
            if($(this).val()!=''){
                vals += "&"+$(this).attr("name")+"="+$(this).val();
            }
        });
        vals = vals.substring(1,vals.length);
        return vals;
    }


    $.zheui.bindTouchGoto($("#getCaptcha"), function(_this){
        var ischeck = true;
        var phone = $("#phone_number");
        var regstr=phone.attr("reg");
        var _val  = phone.val().replace(/[\s]/g,'');
        var regarr = regstr.split("#");
        var msgarr = phone.attr("msg").split("#");
        for(var i=0;i<regarr.length;i++){
            var re=new RegExp(regarr[i]);
            if(!re.test(_val)){
                $.zheui.toast(msgarr[i]);
                ischeck=false;
                return false;
            }
        }
        if(!_this.hasClass("isCountDown") && ischeck){
            getCaptcha();
        }
    });

    //倒计时
    function CountDown(num){
        var num =num;
        var obj = $("#getCaptcha");
        obj.addClass("isCountDown");
        var CountDowning=function(){
            if(num>=0){
                obj.html(num);
                --num;
            }else{
                clearInterval(timer);
                obj.html("获取验证码");
                obj.removeClass("isCountDown");
            }
        }
        var timer = setInterval(CountDowning,1000);
    }

    //获取手机验证码
    //TODO 上线时必须改成 https
    function getCaptcha(){
        CountDown(60);
        var phone = $("#phone_number").val();
        $.ajax({
            type:"POST",
            url:"https://passport.zhe800.com/wap3/users/generate_phone_verify_code",
            data:"phone_number="+phone+"&for_bind_phone_number=false&registered=false",
            dataType:"json",
            success:function(data){
                console.log(data);
                var _data =data;
                if(typeof _data =="object"){
                    $.zheui.toast(_data.message);
                }
            },
            timeout:20000,
            error:function(){
                console.log("网络异常");
                $.zheui.toast("网络异常，请稍后再试.");
            }
        });
    }

    //提交表单
    // callback: {"status":"200","message":"恭喜你，用户注册成功快去领红包吧","return_to":"http://ddd.dd.com/ddd/dd"}
    //TODO 上线前必须改成 https
    function submitForm(){
        $.zheui.loadingbar("show","请求中，请稍后...");
        $.ajax({
            type:"POST",
            url:"https://passport.zhe800.com/wap3/users/create",
            data:getInputVal($(".reg_box input")),
            dataType:"json",
            success:function(data){
                console.log(data);
                var _data =data;
                if(typeof _data =="object"){
                    $.zheui.loadingbar("hide","请求中，请稍后...");
                    $.zheui.toast(_data.message);
                    if(_data.status == 200 && _data.return_to){
                        console.log(_data.return_to);
                        if(!$("#returnTo").length){
                            var iframestr = '<iframe id="returnTo"></iframe>';
                            $("body").append(iframestr);
                        }
                        $("#returnTo").attr("src",_data.return_to);
                        $("#returnTo").hide();
                    }
                }
            },
            timeout:20000,
            error:function(){
                console.log("网络异常");
                $.zheui.loadingbar("hide","请求中，请稍后...");
                $.zheui.toast("网络异常，请稍后再试.");
            }
        });
    }

    function login (type) {
        // body...
    }

    //提交表单
    $.zheui.bindTouchGoto($("#btnSubmit"), function(){
        if(checkInput($(".input_box input"))){
            submitForm();
        }
    });

});