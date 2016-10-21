/*
 * name:track.js
 * intro:统计js
 * version: v1.0
 * author: luoronghang
 * date: 2014/08/15
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
                    document.cookie = "utm_csr=direct;path=/;domain=zhe800.com";
                }
            } else {
                document.cookie = "utm_csr=" + f+";path=/;domain=zhe800.com";
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
            if(h.indexOf("return_to") < 0){
                for (var f = 0, e = g.length; f < e; f++) {
                    if (g[f].indexOf(j) >= 0) {
                        return g[f].split("=")[1];
                    }
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
                t = Date.parse(new Date()),
                g = "//analysis.tuanimg.com/panda/panda_w0.gif?t=" +t+"." + Math.random()*10000000 + "",
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
            //h = $.cookie.get("ju_version");
            //            i = {$http_host: m, $time_local: e, $request: j, $http_referer: l, $http_user_agent: f, $http_cookie: d, $ju_version_header: h};
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



    (function($) {

        $.tracklog = function() {};

        //cookie写入
        $.tracklog.setCookie = function() {
            /*   var gaId="";
            var __utma = $.cookie.get("__utma");
            //var __utma = "148564220.423882428.1393928134.1408084983.1408330568.105";
            if(__utma){
                __utma = __utma.split(".");
                gaId = __utma[1]+"."+__utma[2];
            }*/
            var channelId =$.cookie.get("utm_csr");
            //失效，请自己传值
            var dealId = $.zheui.getUrlKeyVal("id");
            //var deal_type = $.cookie.get("deal_type");
            var deviceId = $.cookie.get("session_id");
            //新老用户标示，0：新用户，1：老用户
            var user_type = $.cookie.get("user_type") || "0";
            //获取用户身份
            var user_role = $.cookie.get("user_role") || "0";
            var utype = user_type + "_" + user_role + "_" + "0";

            //添加PC渠道参数
            var qd_key = $.cookie.get("qd_key");
            var url_qd_key = $.zheui.getUrlKeyVal("qd_key");
            if(!qd_key&&url_qd_key){
                $.cookie.set("qd_key",url_qd_key);
                qd_key = url_qd_key;
            }

            //需要存入cookie的字段
            var param_arr = {
                "source": "tao800_wap",
                "platform": "wap",
                "channelId": channelId,
                "deviceId": deviceId,
                "jump_source": "2",
                "dealId": dealId,
                "utype": utype,
                "qd_key": qd_key
            };
            $.cookie.set("tracklog", JSON.stringify(param_arr));
            console.log("setCookie done");
        };
        $.tracklog.setCookie();

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
                    var out_url = "//out.zhe800.com/jump?url=" + encodeURIComponent(url) + trackstr;
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

        //发送行为日志
        //ev 传入事件名称，param_name为特殊参数名，param_val为特殊参数值
        $.tracklog.action = function(ev, paramobj) {
            var trackobj = JSON.parse($.cookie.get("tracklog"));
            if (trackobj != '' && trackobj != null) {
                if (paramobj != undefined && typeof paramobj == "object") {
                    for (var k in paramobj) {
                        if (paramobj.hasOwnProperty(k)) {
                            trackobj[k] = paramobj[k];
                        }
                    }
                }
                var trackstr = JSON.stringify(trackobj);
                var __imgurl = "//analysis.tuanimg.com/v1/global/img/b.gif" + "?event=" + ev + "&http-header=" + trackstr + "&" + Math.random();
                $(".ga_img").remove();
                $("body").append("<img src='" + __imgurl + "' class='ga_img hide'>");
            };

        }

        //为防止m站恶意点击，获取用户唯一标示，请求数据写入cookie，供out 对匹配
        $.stopCpsBadClick = function() {
            $.ajax({
                type: "GET",
                // url: "//ths.zhe800.com/cpc/userkey?callback=?",
                url: "//t.zhe800.com/cpc/userkey?callback=?",
                dataType: "jsonp",
                success: function(data) {
                    //console.log(data);
                    $.cookie.set("stopCpsBadClick", data);
                },
                timeout: 20000,
                error: function() {}
            });
        };

        $.stopCpsBadClick();

    })(Zepto);
});