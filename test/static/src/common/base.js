/*
 * name:base.js
 * intro:web常见公用方法
 * version: v1.0
 * author: chengjun
 * date: 2014/05/09
 */
define(function (require, exports, module) {
    ;
    (function ($) {

        var base_url = window.location.href;
        var base_url_protocol = window.location.protocol;
        var base_url_come = base_url.indexOf(".com");
        var base_url_protocol = location.protocol;
        var base_url_domain = base_url.substr(0,base_url_come+4);
        var base_url_cookie_arr = base_url_domain.split(".");
        var base_url_cookie = base_url_cookie_arr[base_url_cookie_arr.length - 2];

        //cookie的相关操作
        if (typeof $.cookie !== 'undefined') {
            //如果方法已经定义，则返回
            return;
        }
        $.cookie = {
            //取cookie串
            get: function (name, encode) {
                var arg = name + "=";
                var alen = arg.length;
                var clen = document.cookie.length;
                var i = 0;
                var j = 0;
                while (i < clen) {
                    j = i + alen;
                    if (document.cookie.substring(i, j) == arg)
                        return this.getCookieVal(j, encode);
                    i = document.cookie.indexOf(" ", i) + 1;
                    if (i == 0)
                        break;
                }
                return null;
            },
            //取cookie串下的某个参数值
            getname: function (cookie_name, name) {
                var cookie_val = this.get(cookie_name);
                var regex = new RegExp("[?&]" + encodeURIComponent(name) + "\\=([^&#]+)");
                var value = (cookie_val.match(regex) || ["", ""])[1];
                return decodeURIComponent(value);
            },
            set: function (name, value, expires, path, domain, secure) {
                var argv = arguments;
                var argc = arguments.length;
                //var expires = (argc > 2) ? argv[2] : null;
                var now = new Date();
                var expires = (argc > 2) ? new Date(new Date().getTime() + parseInt(expires) * 24 * 60 * 60 * 1000) : new Date(now.getFullYear(), now.getMonth() + 1, now.getUTCDate());
                var path = (argc > 3) ? argv[3] : '/';
                //TODO 上线前记得修改域名为 .zhe800.com (重要)
                var domain = (argc > 4) ? argv[4] : "."+base_url_cookie+".com";
                var secure = (argc > 5) ? argv[5] : false;
                document.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");
            },
            remove: function (name) {
                if (this.get(name)) this.set(name, "", -1);
            },
            getCookieVal: function (offset, encode) {
                var endstr = document.cookie.indexOf(";", offset);
                if (endstr == -1) {
                    endstr = document.cookie.length;
                }
                if (encode == false) return document.cookie.substring(offset, endstr);
                else return unescape(document.cookie.substring(offset, endstr));
            }
        };

        $.localData = {
            hname: location.hostname ? location.hostname : 'localStatus',
            isLocalStorage: window.localStorage ? true : false,
            dataDom: null,
            initDom: function() { //初始化userData
                if (!this.dataDom) {
                    try {
                        this.dataDom = document.createElement('input'); //这里使用hidden的input元素
                        this.dataDom.type = 'hidden';
                        this.dataDom.style.display = "none";
                        this.dataDom.addBehavior('#default#userData'); //这是userData的语法
                        document.body.appendChild(this.dataDom);
                        var exDate = new Date();
                        exDate = exDate.getDate() + 30;
                        this.dataDom.expires = exDate.toUTCString(); //设定过期时间
                    } catch (ex) {
                        return false;
                    }
                }
                return true;
            },
            set: function(key, value) {
                if (this.isLocalStorage) {
                    window.localStorage.setItem(key, value);
                } else {
                    if (this.initDom()) {
                        this.dataDom.load(this.hname);
                        this.dataDom.setAttribute(key, value);
                        this.dataDom.save(this.hname)
                    }
                }
            },
            get: function(key) {
                if (this.isLocalStorage) {
                    return window.localStorage.getItem(key);
                } else {
                    if (this.initDom()) {
                        this.dataDom.load(this.hname);
                        return this.dataDom.getAttribute(key);
                    }
                }
            },
            remove: function(key) {
                if (this.isLocalStorage) {
                    localStorage.removeItem(key);
                } else {
                    if (this.initDom()) {
                        this.dataDom.load(this.hname);
                        this.dataDom.removeAttribute(key);
                        this.dataDom.save(this.hname)
                    }
                }
            },
            each: function() {
                for (var i = localStorage.length - 1; i >= 0; i--) {
                    console.log('第' + (i + 1) + '条数据的键值为：' + localStorage.key(i) + '，数据为：' + localStorage.getItem(localStorage.key(i)));
                }
            },
            clear:function(){
                for (var i = localStorage.length - 1; i >= 0; i--) {
                    // console.log('第' + (i + 1) + '条数据的键值为：' + localStorage.key(i) + '，数据为：' + localStorage.getItem(localStorage.key(i)));
                    localStorage.removeItem(localStorage.key(i));
                }
            },
            merge:function(k,v){
                console.log("localData merage method start");
                var oldVal = JSON.parse(localData.get(k));
                var newVal = JSON.parse(v);
                var finalVal=[]
                for (var i = 0; i < oldVal.length; i++) {
                     finalVal.push(oldVal[i]);
                }

                for (var i = 0; i < newVal.length; i++) {
                    finalVal.push(newVal[i]);
                }
                localData.set(k,JSON.stringify(finalVal));
            }
        }
        $.zheui = function () {
        };
        //公共接口地址配置
        //$.zheui.domain = "http://h5.m.xiongmaoz.com";
        $.zheui.domain = base_url_domain;
        $.zheui.protocol =base_url_protocol;
        $.zheui.ga_img_url = "//analysis.tuanimg.com/v1/global/img/b.gif";
        //删除指定url上的字段
        $.zheui.removeUrlKeyPair = function (url, key) {
            var reg = new RegExp(key + "=[^&]*", "gmi");
            url = url.replace(reg, "");
            if (url.indexOf('&') == url.length - 1)url = url.substring(0, url.length - 1);
            if (url.indexOf('?') == url.length - 1)url = url.substring(0, url.length - 1);
            url = url.replace("?&", "?").replace('&&', '&');
            return url;
        };

        //获取URL上指定参数值
        $.zheui.getUrlKeyVal = function (name) {
            var regex = new RegExp("[?&]" + encodeURIComponent(name) + "\\=([^&#]+)");
            var value = (location.search.match(regex) || ["", ""])[1];
            return decodeURIComponent(value);
        };
        /*
         * desc:或缺URL上指定参数值，复杂情况，如带有return_to网址，getUrlKeyVal无效
         * author: wangguanjia
         */
        $.zheui.newGetUrlKeyVal = function (name)
        {
             var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
             var r = window.location.search.substr(1).match(reg);
             if(r!=null)return  unescape(r[2]); return null;
        };

        $.zheui.directUrl = function(){
            var url = $.zheui.getUrlKeyVal('return_to');
            (url != '') ? url = $.zheui.getUrlKeyVal('return_to') : url = "//m.zhe800.com";
            window.location.href = url;
        }
        $.zheui.directUrlThird=function(){
            var url = $.zheui.getUrlKeyVal('return_to');
            (url != '') ? url = $.zheui.getUrlKeyVal('return_to')+'&status=success&usage=login' : url = "//m.zhe800.com";
            window.location.href = url;
        };
        //toast提示，2秒后自动消失
        var timer = null;
        $.zheui.toast=function(txt){
            var ct = $("#ct");
            if(!$('.toast_box').length){
                ct.append('<div class="toast_box"></div>');
            }
            var _toast = $(".toast_box");
            _toast.text(txt);
            _toast.show();
            setTimeout(function(){
                _toast.css("opacity","1");
            },1);
            var wh = window.innerHeight;
            var ww = window.document.body.clientWidth;
            var max = Math.max(wh,document.body.clientHeight);
            var _toast_h  = _toast.height();
            var _toast_w  = _toast.width();
            var _top = (wh-_toast_h)/2;
            var _left = (ww-_toast_w)/2;
            _toast.css({"top":_top+"px","left":_left+"px"});
            if(timer){
                clearTimeout(timer);
            }
            timer = setTimeout(function(){
                _toast.css("opacity","0");
                setTimeout(function(){
                    _toast.hide();
                },200);
            },2000);
        }

        //loadingbar，cmd：show/hide,txt:提示文字
        $.zheui.loadingbar=function(cmd,txt){
            var ct = $("#ct");
            if(!$('.bg_layer2').length){
                ct.append('<div class="bg_layer2"></div>');
            }
            if(!$('.loading_box').length){
                ct.append('<div class="loading_box"><h2 class="tit">温馨提示</h2><div class="con_txt"></div></div>');
            }
            var _bg = $(".bg_layer2");
            var _loading = $(".loading_box");
            _loading.find(".con_txt").text(txt);
            if(cmd =="show"){
                _bg.show();
                _loading.show();
                setTimeout(function(){
                    _bg.css("opacity","1");
                    _loading.css("opacity","1");
                },1);
                var wh = window.innerHeight;
                var ww = window.document.body.clientWidth;
                var max = Math.max(wh,document.body.clientHeight);
                var _loading_h  = _loading.height();
                var _loading_w  = _loading.width();
                var _top = (wh-_loading_h)/2;
                var _left = (ww-_loading_w)/2;
                _loading.css({"top":_top+"px","left":_left+"px"});
                _bg.css("height",max+"px");
            }else if(cmd =="hide"){
                _bg.css("opacity","0");
                _loading.css("opacity","0");
                setTimeout(function(){
                    _bg.hide();
                    _loading.hide();
                },200);
            }
        };

        //为一个或多个元素绑定touch跳转事件
        var touch_pre_time = 0;
        $.zheui.bindTouchGoto = function (arr, gotofun) {
            var x_ismove, x_finger;
            arr.each(function (index, ele) {
                $(ele).bind("touchstart",function (e) {
                    x_ismove = false;
                    x_finger = e.touches.length;
                    $(this).addClass('hover');
                    e.stopPropagation();
                }).bind("touchmove",function (e) {
                        x_ismove = true;
                        $(this).removeClass('hover');
                        e.stopPropagation();
                    }).bind("touchend",function (e) {
                        var touch_now = Date.now();
                        if(touch_now - touch_pre_time < 250){
                            $(this).removeClass('hover');
                            touch_pre_time = touch_now;
                            return;
                        }
                        touch_pre_time = touch_now;
                        $(this).removeClass('hover');
                        if (x_ismove || x_finger > 1) {
                            e.stopPropagation();
                            return;
                        }
                        e.stopPropagation();
                        if (typeof gotofun == "function") {
                            //console.log(gotofun);
                            gotofun($(this), index);
                        }
                    }).bind("touchcancel", function () {
                        $(this).removeClass('hover');
                    });
            });
        };

        $.zheui.versions = function(userAgent){
            //alert(userAgent.match(/(Xiaomi)\s+([\d.]+)/));    
            //if(userAgent.match((/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/)) && userAgent.match(/(Xiaomi)\s+([\d.]+)/)){
            if(userAgent.indexOf("Android") > -1 || userAgent.indexOf("Linux") > -1){
                return 'android';
            }else if(userAgent.match(/(iPad).*OS\s([\d_]+)/)){
                return 'ipad';
            }else if(userAgent.match(/(iPhone\sOS)\s([\d_]+)/)){
                return 'iphone';
            }else{
                return userAgent;
            }
        };
        $.zheui.webpCheck = function(){
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            // alert(userAgent);
            if (userAgent.indexOf("Safari") > -1) {
                // alert("webp not ok");
                return false;
            }else{
               return true; 
            }
        };
        //判断手机系统
        function zhe_os(userAgent) {
            $.os = {};
            $.os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
            $.os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
            $.os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
            $.os.iphone = !$.os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
            $.os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
            $.os.touchpad = $.os.webos && userAgent.match(/TouchPad/) ? true : false;
            $.os.ios = $.os.ipad || $.os.iphone;
            $.os.blackberry = userAgent.match(/BlackBerry/) || userAgent.match(/PlayBook/) ? true : false;
            $.os.opera = userAgent.match(/Opera Mobi/) ? true : false;
            $.os.fennec = userAgent.match(/fennec/i) ? true : false;
            $.os.isIos4 = ($.os.ios && navigator.appVersion.toLowerCase().indexOf("os 4") > -1) ? true : false;
            $.os.desktop = !($.os.ios || $.os.android || $.os.blackberry || $.os.opera || $.os.fennec);
        }

        zhe_os(navigator.userAgent);

        //判断浏览器
        function zhe_browser(userAgent) {
            $.bs = {};
            $.bs.miui = /miuibrowser/.test(userAgent);
            $.bs.uc = /ucbrowser/.test(userAgent);
            $.bs.qq = /mqqbrowser/.test(userAgent);
            $.bs.baidu = /baidubrowser/.test(userAgent);
            $.bs.safari = /safari/.test(userAgent);
        }

        zhe_browser(navigator.userAgent.toLowerCase());

        //后退按钮
        $.zheui.pageBack=function(){
            var _url = window.location.href;
            if(/#top/.test(_url)){
                window.history.go(-2);
            }else{
                window.history.back();
            }
        };
        if($(".btn_back").length){
            $.zheui.bindTouchGoto($(".btn_back"),function(obj){
                $.zheui.pageBack();
            });
        }

        //加塞浏览历史记录 o:标识码
        /*
         将当前URL和history.state加入到history中，并用新的state和URL替换当前。不会造成页面刷新。
         state：与要跳转到的URL对应的状态信息。
         title：不知道干啥用，传空字符串就行了。
         url：要跳转到的URL地址，不能跨域。
         */
        $.zheui.addhistory=function(){
            history.pushState("box", "", base_url+"#box");
        };
        $.zheui.checkWebp=function(callback){
         var webP = new Image();
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
            webP.onload = webP.onerror = function () {
                callback(webP.height === 2);
            };
        };
        $.zheui.testWebpNotify=function(supported){
            return(supported) ? true : false;
        };
        $.zheui.protocol = location.protocol;
        $.zheui.scrollTo = function (misec, top) {
            var n = 0, timer = null;

            var smoothScroll = function () {
                var per = 1;
                n = n + per;
                if (n >= top) {
                    window.clearInterval(timer);
                    return false;
                }
                document.body.scrollTop = n;
            };

            timer = window.setInterval(function () {
                smoothScroll();
            }, Math.round(misec / top));
        };

        //改变图片大小。img:可以传图片名称或URL, size:修改的尺寸"100x100"等
        $.zheui.change_img_size = function(img, size) {
            var img_arr = img.split("/");
            var img_arr_length = img_arr.length;
            var img_name = img;
            if (img_arr_length > 1) {
                img_name = img_arr[img_arr_length - 1];
            }
            var img_name_arr = img_name.split(".");
            if (img_name_arr.length == 3) {
                img_name_arr.splice(img_name_arr.length - 1, 0, size);
            }
            if (img_name_arr.length == 4) {
                img_name_arr.splice(img_name_arr.length - 2, 1, size);
            }
            var new_img_name = img_name_arr.join(".");
            return img.replace(img_name,new_img_name);
        }
         /*当前设备是否支持webp格式图片*/
        $.zheui.check_iswebp =  function(callback){
             var img = new Image();
            img.onload = function () {
                // alert("suc-----+---");
                var result = (img.width > 0) && (img.height > 0);
                callback(result);
            };
            img.onerror = function () {
                // alert("fail-----+----");
                callback(false);
            };
            img.src = "data:image/webp;base64,UklGRpgAAABXRUJQVlA4IIwAAADQDgCdASrgAPQAPiEQhkMhhAQGAIEtLdwu1iNoAT036stK/9WWlf+rLSv/VlpX/qy0r/1ZaV/6stK/9WWlf+rLSv/VlpX/qy0r/1ZaV/6stK/9WWlf+rLSv/VlpX/qy0r/1ZaV/6stK/9WWlf+rLSv/VlpX/qy0r/1ZaV/6rAAAP7/9LnAAAAAAAAAAA==";
        }
    })(Zepto);
});
