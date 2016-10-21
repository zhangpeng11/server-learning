/*
 * name:track.js
 * intro:统计js
 * version: v1.0
 * author: spf
 * date: 2015/08/10
 */
define(function(require, exports, module) {
    var track_url = window.location.href;
    var track_url_come = track_url.indexOf(".com");
    var track_url_domain = track_url.substr(0, track_url_come + 4);
    var track_url_cookie_arr = track_url_domain.split(".");
    var track_url_cookie = track_url_cookie_arr[track_url_cookie_arr.length - 2];

    (function(b, f) {
        var b = b,
            e = b.document;
        var a = function(j, k, h) {
            if (arguments.length == 0) {
                try {
                    if (navigator.cookieEnabled == false) {
                        return false;
                    }
                } catch (m) {
                    if (b.console) {
                        console.info(m);
                    }
                }
                return true;
            }
            if (arguments.length > 1 && String(k) !== "[object Object]") {
                if (k === null || k === f) {
                    h.expires = -1;
                }
                if (typeof h.expires === "number") {
                    var n = h.expires,
                        i = h.expires = new Date();
                    i.setDate(i.getDate() + n);
                }
                k = String(k);
                return (document.cookie = [encodeURIComponent(j), "=", h.raw ? k : encodeURIComponent(k), h.expires ? "; expires=" + h.expires.toUTCString() : "", h.path ? "; path=" + h.path : "", h.domain ? "; domain=" + h.domain : "", h.secure ? "; secure" : ""].join(""));
            }
            h = k || {};
            var g, l = h.raw ? function(o) {
                return o;
            } : decodeURIComponent;
            return (g = new RegExp("(?:^|; )" + encodeURIComponent(j) + "=([^;]*)").exec(document.cookie)) ? l(g[1]) : "";
        };
        var c = function() {
            return Math.round(2147483647 * Math.random());
        };
        var d = function() {
            return Math.round(new Date().getTime() / 1000);
        };
        if (a("session_id") === "") {
            a("session_id", c() + "." + d(), {
                expires: 365 * 2,
                domain: "." + track_url_cookie + ".com",
                path: "/"
            });
        }
    })(window);

    (function(b) {
        function d() {
            var f = a("utm_source");
            if ($.cookie.get("_ga") == null) {
                var e = [];
            } else {
                var e = $.cookie.get("_ga").split(".");
            }

            if (f == "" || f == undefined) {
                if ($.cookie.get("utm_csr") == null) {
                    document.cookie = "utm_csr=direct";
                }
            } else {
                document.cookie = "utm_csr=" + f;
            }
            if (e.length > 1) {
                user_id = e[e.length - 2] + "." + e[e.length - 1];
                $.cookie.set("user_id", user_id, 365);
            } else {
                $.cookie.set("user_id", "", 365);
            }
        }

        function c() {
            if ($.cookie.get("utm_csr_first") !== null) {
                return;
            } else {
                var e = a("utm_source");
                if (e == "" || e == undefined) {
                    $.cookie.set("utm_csr_first", "direct", 365);
                } else {
                    $.cookie.set("utm_csr_first", e, 365);
                }
            }
        }

        function a(j) {
            var h = location.search.split("?")[1] || "",
                g = h.split("&") || [],
                j = j;
            if (g.length == 0) {
                return "";
            }
            for (var f = 0, e = g.length; f < e; f++) {
                if (g[f].indexOf(j) >= 0) {
                    return g[f].split("=")[1];
                }
            }
            return "";
        }

        b(document).ready(function() {
            d();
            c();
        });
    })(Zepto);
    (function(b) {
        function c(f) {
            var e = document.createElement("img"),
                g = "//analysis.tuanimg.com/panda/panda_w0.gif?",
                h = [];
            for (var d in f) {
                if (f.hasOwnProperty(d)) {
                    h.push(d + "=" + f[d]);
                }
            }
            e.src = g + h.join("&");
            e.onload = function() {
                b(this).remove();
            };
            document.body.appendChild(e);
        }

        function a() {
            var m, e, j, g, n, l, f, d, h, i, k = window.location;
            m = k.host;
            e = new Date();
            j = k.pathname + k.search;
            l = document.referrer;
            f = navigator.userAgent;
            d = document.cookie;
            i = {
                $http_host: m,
                $time_local: e,
                $request: j,
                $http_referer: l,
                $http_user_agent: f,
                $http_cookie: d
            };
            c(i);
        }

        b(document).ready(function() {
            a();
        });
    })(Zepto);

    $.tracklog = function() {};
    var param_arr = {};
    var get_track_common = { //配置默认需要统计的参数、获取客户端支持的所有的协议
        page_zheclient: function() {
            var _this = this;
            var networking = "wifi";
            //获取native支持的所有方法
            $.common.get_allmethod("$.calljs.get_allmethod");
            $.calljs.nativeinfoCallback = function(data) {
                var param_arr_all = JSON.parse(data); //native数据
                param_arr.listversion = param_arr_all.listversion;
                param_arr.userId = param_arr_all.userid;
                param_arr.source = "tao800_app";
                param_arr.jump_source = 2;
                param_arr.deviceId = param_arr_all.deviceId;
                param_arr.mobileno = param_arr_all.mobileno;
                param_arr.school = param_arr_all.school;
                param_arr.resolution = param_arr_all.resolution;
                param_arr.sysversion = param_arr_all.sysversion;
                param_arr.version = param_arr_all.version;
                param_arr.platform = param_arr_all.platform;
                param_arr.usertype = param_arr_all.usertype;
                param_arr.userrole = param_arr_all.userrole;
                param_arr.channel = param_arr_all.channelId;
                param_arr.child = param_arr_all.child;
                param_arr.mId = param_arr_all.mId || param_arr_all.mid;
                param_arr.networking = networking;
            };
            $.calljs.get_allmethod = function(data) {
                _this.allmethod = JSON.parse(data);
                if (_this.allmethod.network_status) {
                    //获取网络状态
                    $.common.network_status("$.calljs.networkStatusCallback");
                } else {
                    //获取native信息
                    $.common.get_nativeinfo("$.calljs.nativeinfoCallback");
                }
            };
            $.calljs.networkStatusCallback = function(data) {
                networking = data;
                //获取native信息
                $.common.get_nativeinfo("$.calljs.nativeinfoCallback");
            };
        },
        page_wapapp: function(page_platform) {
            /*
             * page_platform
             * "m"指M站
             * "wx"指微信
             * "hz"指合作项目
             *  默认为m站
             */
            var platform = page_platform == "hz" ? "dwhz" : (page_platform == "wx" ? "weixin" : "wap");
            var channel = $.cookie.get("utm_csr");
            var session_id = $.cookie.get("session_id");
            var visit = $.cookie.get("visit") ? parseInt($.cookie.get("visit")) : 1;
            var userId = $.cookie.get("user_id");
            $.cookie.set("visit", visit + 1);
            //新老用户标示，0：新用户，1：老用户
            var user_type = $.cookie.get("user_type") || "0";
            //获取用户身份
            var user_role = $.cookie.get("user_role") || "0";
            $.cookie.set("user_role",user_role);
            //需要存入cookie的字段
            param_arr = {
                "source": "tao800_wap",
                "jump_source": 2,
                "platform": platform,
                "channel": channel,
                "deviceId": session_id,
                "session_id": session_id,
                "visit": visit,
                "school": 0,
                "usertype": user_type,
                "userrole": user_role,
                "userId":userId
            };
        },
        page_Share: function(page_platform) {
            var channel = $.cookie.get("utm_csr");
            var session_id = $.cookie.get("session_id");
            var visit = $.cookie.get("visit") ? parseInt($.cookie.get("visit")) : 1;
            var userId = $.cookie.get("user_id");
            $.cookie.set("visit", visit + 1);
            //新老用户标示，0：新用户，1：老用户
            var user_type = $.cookie.get("user_type") || "0";
            //获取用户身份
            var user_role = $.cookie.get("user_role") || "0";
            $.cookie.set("user_role",user_role);
            var channel = "share";
            var platform = $.zheui.newGetUrlKeyVal("share_platform")||"";
            var share_Type = $.zheui.newGetUrlKeyVal("share_Type")||"";
            //需要存入cookie的字段
            param_arr = {
                "source": "tao800_wap",
                "jump_source": 2,
                "platform": platform,
                "channel": channel,
                "deviceId": session_id,
                "session_id": session_id,
                "visit": visit,
                "school": 0,
                "usertype": user_type,
                "userrole": user_role,
                "userId":userId,
                "channel":channel,
                "share_Type":share_Type,
                "platform":platform
            };
        }
    };
    exports.init = function(page_from) { //提供调用接口(根据不同的平台配置不同的默认参数，默认为m站)
        if($.zheui.getUrlKeyVal("share_platform") != ''){
            get_track_common.page_Share();
        }else{
            page_from == "zheclient" ? get_track_common.page_zheclient() : get_track_common.page_wapapp(page_from);
        }
    };
    $.tracklog.trackOutstr = function(track_data) { //需要统计的参数拼接
        var params = [];
        $.extend(params, param_arr, track_data);
        for (key in params) {
            params.push(key + "=" + params[key]);
        }
        return params.join("&"); //返回统计后面的拼接参数
    };

    //添加pos_value和pos_type
    $.tracklog.addCokkie = function(paramobj){
        if(paramobj != undefined && typeof paramobj == "object"){
            for (var k in paramobj){
                if(paramobj.hasOwnProperty(k)){
                    $.cookie.set(k,paramobj[k]);
                }
            }
        }
    }

    //封装outurl
    $.tracklog.outUrl = function(url, arg) {
        var trackobj = JSON.parse($.cookie.get("tracklog"));
        var trackstr="", argfilter = {};
        for(var k in trackobj){
            if(trackobj.hasOwnProperty(k)){
                if (arg && arg[k]) {
                    trackstr += "&"+ k + "=" + arg[k];
                    argfilter[k] = true;
                }
                else {
                    trackstr += "&"+ k + "=" + trackobj[k];
                }
            }
        }

        if (url.indexOf("//out.") > 0) {
            trackstr = trackstr.substr(1);
            var out_url = encodeURI(url) + "?" + trackstr;
        } else {
            var out_url = "http://out.zhe800.com/jump?url=" + encodeURIComponent(url) + trackstr;
        }

        if (arg) {
            var args = "";
            $.each(arg,function(o,p){
                if (!argfilter[o]) {
                    args += "&"+o+"="+p;
                }
            });
            out_url += args;
        }
        var this_url = window.location.href;
        //首页
        if ($(".index_w").length > 0) {
            var cId = $.cookie.get("user_role") || "0";
            out_url += "&cType=0&cId=" + cId;
        }
        //首页上的分类页
        if(this_url.indexOf("m/list/") > 0 || this_url.indexOf("m/catelist/") > 0){
            var cId = $.zheui.getUrlKeyVal("url_name");
            if(this_url.indexOf("/m/list/all?url_name=all&category_name="+encodeURIComponent("今日更新")+"&time=today") > 0){
                //今日更新
                out_url += "&cType=7&cId=" + cId;
            }else if(this_url.indexOf("/m/list/all?url_name=all&category_name="+encodeURIComponent("全部")+"&shop_type=4") > 0){
                //  特卖商城
                out_url += "&cType=34&cId=" + cId;
            }else {
                out_url += "&cType=0&cId=" + cId;
            }
        }
        //值得逛
        if (this_url.indexOf("m/guang") > 0) {
            out_url += "&cType=1&cId=";
            if (typeof(url_name) != 'undefined' && url_name != '') {
                out_url += url_name;
            }
        }
        //首页banner
        if (this_url.indexOf("m/zt/zt") > 0) {
            var from_index = $.zheui.getUrlKeyVal("from_index") || "";
            var cId = $.zheui.getUrlKeyVal("id");
            if (from_index == 1) {
                out_url += "&cType=2&cId=" + cId;
            } else {
                out_url += "&cType=17&cId=" + cId;
            }
        }
        //手机周边
        if (this_url.indexOf("m/mobile/mobile") > 0) {
            out_url += "&cType=5";
        }
        //品牌团
        if (this_url.indexOf("m/brand/list") > 0) {
            var cId = $.zheui.getUrlKeyVal("url_name");
            out_url += "&cType=6&cId=" + cId;
        }
        //搜索列表页
        if (this_url.indexOf("m/sou/soulist") > 0) {
            var cId = encodeURIComponent($.zheui.getUrlKeyVal("key"));
            out_url += "&cType=11&cId=" + cId;
        }
        //每日十件
        if (this_url.indexOf("m/day10/day10") > 0) {
            out_url += "&cType=14";
        }
        return out_url;
    };
    //封装outurl
    $.tracklog.outShareUrl = function(url, arg) {
        var trackobj = JSON.parse($.cookie.get("tracklog")),
            channel = "share",
            platform = $.zheui.newGetUrlKeyVal("share_platform")||"",
            share_Type = $.zheui.newGetUrlKeyVal("share_Type")||"";
        var trackstr="", argfilter = {};
        for(var k in trackobj){
            console.log(trackobj[k]);
            if(trackobj.hasOwnProperty(k)){
                if (arg && arg[k]) {
                    trackstr += "&"+ k + "=" + arg[k];
                    argfilter[k] = true;
                }
                else {
                    trackstr += "&"+ k + "=" + trackobj[k];
                }
            }
        }

        if (url.indexOf("//out.") > 0) {
            trackstr = trackstr.substr(1);
            var out_url = encodeURI(url) + "?" + trackstr;
        } else {
            var out_url = "http://out.zhe800.com/jump?url=" + encodeURIComponent(url) + trackstr;
        }

        if (arg) {
            var args = "";
            $.each(arg,function(o,p){
                if (!argfilter[o]) {
                    args += "&"+o+"="+p;
                }
            });
            out_url += args;
        }
        var this_url = window.location.href;
        //首页
        if ($(".index_w").length > 0) {
            var cId = $.cookie.get("user_role") || "0";
            out_url += "&cType=0&cId=" + cId;
        }
        //首页上的分类页
        if(this_url.indexOf("m/list/") > 0){
            var cId = $.zheui.getUrlKeyVal("url_name");
            if(this_url.indexOf("/m/list/all?url_name=all&category_name="+encodeURIComponent("今日更新")+"&time=today") > 0){
                //今日更新
                out_url += "&cType=7&cId=" + cId+"&channel="+channel+"&platform="+platform+"&share_Type="+share_Type;
            }else if(this_url.indexOf("/m/list/all?url_name=all&category_name="+encodeURIComponent("全部")+"&shop_type=4") > 0){
                //  特卖商城
                out_url += "&cType=34&cId=" + cId;
            }else {
                out_url += "&cType=0&cId=" + cId+"&channel="+channel+"&platform="+platform+"&share_Type="+share_Type;
            }
        }
        //值得逛
        if (this_url.indexOf("m/guang") > 0) {
            out_url += "&cType=1&cId="+"&channel="+channel+"&platform="+platform+"&share_Type="+share_Type;
            if (typeof(url_name) != 'undefined' && url_name != '') {
                out_url += url_name;
            }
        }
        //首页banner
        if (this_url.indexOf("m/zt/zt") > 0) {
            var from_index = $.zheui.getUrlKeyVal("from_index") || "";
            var cId = $.zheui.getUrlKeyVal("id");
            if (from_index == 1) {
                out_url += "&cType=2&cId=" + cId;
            } else {
                out_url += "&cType=17&cId=" + cId;
            }
        }
        //手机周边
        if (this_url.indexOf("m/mobile/mobile") > 0) {
            out_url += "&cType=5";
        }
        //品牌团
        if (this_url.indexOf("m/brand/list") > 0) {
            var cId = $.zheui.getUrlKeyVal("url_name");
            out_url += "&cType=6&cId=" + cId;
        }
        //搜索列表页
        if (this_url.indexOf("m/sou/soulist") > 0) {
            var cId = encodeURIComponent($.zheui.getUrlKeyVal("key"));
            out_url += "&cType=11&cId=" + cId;
        }
        //每日十件
        if (this_url.indexOf("m/day10/day10") > 0) {
            out_url += "&cType=14";
        }
        return out_url;
    };    
    $.tracklog.action = function(ev, paramobj, param) { //0像素打点
        var trackobj = param_arr;
        if (paramobj != undefined && typeof paramobj == "object") {
            for (var k in paramobj) {
                if (paramobj.hasOwnProperty(k)) {
                    trackobj[k] = paramobj[k];
                }
            }
        }
        var trackstr = JSON.stringify(trackobj);
        //console.log(trackstr);
        var __imgurl = "//analysis.tuanimg.com/v1/global/img/b.gif" + "?event=" + ev + "&http-header=" + trackstr;
        if (param) {
            __imgurl += "&param=" + param +"&"+ Math.random();
        }else{
            __imgurl += "&"+ Math.random();
        }
        $(".ga_img").remove();
        $("body").append("<img src='" + __imgurl + "' class='ga_img hide'>");
    };
    $.tracklog.sendNative = function(paramobj) { //向客户端发送统计数据
        if (get_track_common.allmethod && get_track_common.allmethod.tracklogs) {
            $.common.tracklogs(paramobj);
        }
    };
});