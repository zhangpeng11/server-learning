/*
 * name:exposure.js
 * intro:曝光统计
 * version: v1.0
 * author: luoronghang
 * date: 2015/03/17
 */
define(function(require, exports, module) {
    require('../common/base');
    var base64 = require('../common/base64');
    var base64str = new base64();

    //@ arr_par 曝光商品信息外层父节点，比如（ul）
    //@ arr_chi 曝光商品信息的dom节点，比如（li）
    exports.exposure_ev=function(arr_par,arr_chi){

        var _arr_par = $(arr_par);
        var _arr_chi = arr_chi;

        //取元素的页面绝对 Y位置
        var getTop = function(El){
            try {
                var top = 0;
                do {
                    top += El.offsetTop;
                } while ((El = El.offsetParent).nodeName != 'BODY');
                return top;
            }catch(err){}
        };

        //获取曝光数据
        var getdata = function(dealsinfo){

            var pathname = window.location.pathname;
            var pos_type = "home";
            var pos_value = dealsinfo.val || "";
            var refer =document.referrer;
            var platform = "wap";

            pathname = pathname.indexOf("/m/list/") > -1 ? "/m/list/" : pathname;

            switch (pathname){
                case "/m/list/":
                    var parent_url_name =$.zheui.getUrlKeyVal("parent_url_name");
                    var url_name = $.zheui.getUrlKeyVal("url_name");
                    var time = $.zheui.getUrlKeyVal("time");
                    if(parent_url_name){
                        pos_type = "jutag";
                        pos_value = parent_url_name+"/"+url_name;
                    }else{
                        if(url_name=="baoyou"){
                            pos_type = "baoyo";
                        }else if(url_name=="all" && time=="today"){
                            pos_type = "today";
                        }else{
                            pos_type = "jutag";
                            pos_value = url_name;
                        }
                    }
                    break;
                case "/m/sou/soulist":
                    var keys = $.zheui.getUrlKeyVal("key");
                    if(keys.length>10){
                        keys = keys.substring(0,10);
                    }
                    pos_type = "search";
                    pos_value = keys;
                    break;
                case "/m/zt/zt":
                    var brand_id = $.zheui.getUrlKeyVal("id");
                    pos_type = "topic";
                    pos_value = brand_id;
                    break;
                case "/m/category/category":
                    pos_type = "jutag";
                    break;
                case "/m/mobile/mobile":
                    pos_type = "phone";
                    break;
                case "/m/forecast/forecast":
                    pos_type = "yugao";
                    break;
                case "/m/day10/day10":
                    pos_type = "ten";
                    break;
                case "/m/brand/list":
                    var brand_id = $.zheui.getUrlKeyVal("brand_id");
                    var url_name = $.zheui.getUrlKeyVal("url_name");
                    pos_type = "bdlst";
                    pos_value = brand_id;
                    break;

            }

            var uid = "";
            if($.cookie.get("ppinf")){
                var uinfarr = $.cookie.get("ppinf").split("|");
                var u_jsonstr = base64str.utf8to16(base64str.decodeBase64(uinfarr[uinfarr.length-1]));
                var u_json = JSON.parse(u_jsonstr);
                uid = u_json.uid;
            }
            var deviceid = $.cookie.get("session_id") || "";
            var cookieid =$.cookie.get("user_id") || ""; // 这里的user_id 实际是ga种下的 GAid 跟折800用户信息没关系
            var utm_source =$.cookie.get("utm_csr") || "";
            var userrole = $.cookie.get("user_role")||"";
            var usertype = $.cookie.get("user_type")||"";
            var url = encodeURIComponent(window.location.href);
            var share = $.zheui.newGetUrlKeyVal("share")||"";

            var datastr = "pos_type="+pos_type+
                "&pos_value="+pos_value+
                "&refer="+refer+
                "&uid="+uid+
                "&deviceid="+deviceid+
                "&cookieid="+cookieid+
                "&fromsource=2"+"&platform="+platform+
                "&version=&channel="+utm_source+
                "&userrole="+userrole+
                "&usertype="+usertype+
                "&school=&child=&listversion=&url="+url+
                "&deals="+dealsinfo+
                "&share="+share;

            return datastr;
        };
        //获取分享曝光数据
        var getShareData = function(dealsinfo){

            var pathname = window.location.pathname;
            var pos_type = "home";
            var pos_value = dealsinfo.val || "";
            var refer =document.referrer;

            pathname = pathname.indexOf("/m/list/") > -1 ? "/m/list/" : pathname;

            switch (pathname){
                case "/m/list/":
                    var parent_url_name =$.zheui.getUrlKeyVal("parent_url_name");
                    var url_name = $.zheui.getUrlKeyVal("url_name");
                    var time = $.zheui.getUrlKeyVal("time");
                    if(parent_url_name){
                        pos_type = "jutag";
                        pos_value = parent_url_name+"/"+url_name;
                    }else{
                        if(url_name=="baoyou"){
                            pos_type = "baoyo";
                        }else if(url_name=="all" && time=="today"){
                            pos_type = "today";
                        }else{
                            pos_type = "jutag";
                            pos_value = url_name;
                        }
                    }
                    break;
                case "/m/sou/soulist":
                    var keys = $.zheui.getUrlKeyVal("key");
                    if(keys.length>10){
                        keys = keys.substring(0,10);
                    }
                    pos_type = "search";
                    pos_value = keys;
                    break;
                case "/m/zt/zt":
                    var brand_id = $.zheui.getUrlKeyVal("id");
                    pos_type = "topic";
                    pos_value = brand_id;
                    break;
                case "/m/category/category":
                    pos_type = "jutag";
                    break;
                case "/m/mobile/mobile":
                    pos_type = "phone";
                    break;
                case "/m/forecast/forecast":
                    pos_type = "yugao";
                    break;
                case "/m/day10/day10":
                    pos_type = "ten";
                    break;
                case "/m/brand/list":
                    var brand_id = $.zheui.getUrlKeyVal("brand_id");
                    var url_name = $.zheui.getUrlKeyVal("url_name");
                    pos_type = "bdlst";
                    pos_value = brand_id;
                    break;

            }

            var uid = "";
            if($.cookie.get("ppinf")){
                var uinfarr = $.cookie.get("ppinf").split("|");
                var u_jsonstr = base64str.utf8to16(base64str.decodeBase64(uinfarr[uinfarr.length-1]));
                var u_json = JSON.parse(u_jsonstr);
                uid = u_json.uid;
            }
            var deviceid = $.cookie.get("session_id") || "";
            var cookieid =$.cookie.get("user_id") || ""; // 这里的user_id 实际是ga种下的 GAid 跟折800用户信息没关系
            var utm_source =$.cookie.get("utm_csr") || "";
            var userrole = $.cookie.get("user_role")||"";
            var usertype = $.cookie.get("user_type")||"";
            var url = encodeURIComponent(window.location.href);
            var share = $.zheui.newGetUrlKeyVal("share")||"";
            var channel = "share";
            var platform = $.zheui.newGetUrlKeyVal("share_platform")||"";
            var share_Type = $.zheui.newGetUrlKeyVal("share_Type")||"";

            var datasharestr = "pos_type="+pos_type+
                "&pos_value="+pos_value+
                "&refer="+refer+
                "&uid="+uid+
                "&deviceid="+deviceid+
                "&cookieid="+cookieid+
                "&fromsource=2"+"&platform="+platform+
                "&version=&channel="+utm_source+
                "&userrole="+userrole+
                "&usertype="+usertype+
                "&school=&child=&listversion=&url="+url+
                "&deals="+dealsinfo+
                "&channel="+channel+
                "&platform="+platform+
                "&share="+share;

            return datasharestr;
        };
        //发送日志
        function sendlogs(){
            var _scrollTop =  document.body.scrollTop,
                _visibleHeight = document.documentElement.clientHeight;
            for(var i=0 ; i < _arr_par.length; i++){
                var par_height = _arr_par[i].offsetHeight;
                var _arrTop = getTop(_arr_par[i]);
                if( (_arrTop + par_height) >= _scrollTop && _arrTop <= (_scrollTop + _visibleHeight)){
                    //console.log($(_arr_par[i]).attr("id"));
                    var sub_arr = $(_arr_par[i]).find(_arr_chi);
                    var _index = $(_arr_par[i]).index() * sub_arr.length;
                    //console.log("ul_index:"+$(_arr_par[i]).index());
                    for(var j=0 ; j < sub_arr.length; j++){
                        var _arrTop2 = getTop(sub_arr[j]);
                        var sub_arr_status = $(sub_arr[j]).attr("expos");
                        if( _arrTop2 >= _scrollTop && _arrTop2 <= _scrollTop+_visibleHeight){
                            //console.log("li:"+( _index+1 + $(sub_arr[j]).index()));
                            //expos 用来记录是否被曝光过，0 是未曝光或已被曝光过并且滑出可视区域，1 是已曝光
                            //如果 元素上 expos 属性不为1 则发送曝光日志
                            if(sub_arr_status !="1"){
                                var dealid = $(sub_arr[j]).attr("data-id") || "";
                                var pos_value = $(sub_arr[j]).attr("data-val") || "";
                                var deals = [{
                                    "id":dealid,
                                    "n":( _index+1 + $(sub_arr[j]).index()),
                                    "time":new Date().getTime(),
                                    "val":pos_value
                                }];
                                deals = encodeURI(JSON.stringify(deals));
                                var data = getdata(deals);
                                $(sub_arr[j]).find("#exposImg").remove();
                                $(sub_arr[j]).append('<img src="//analysis.tuanimg.com/bgl_v2.gif?'+data+'" id="exposImg">');
                                $(sub_arr[j]).find("#exposImg").hide();
                                $(sub_arr[j]).attr("expos","1");
                            }
                        }else{
                            $(sub_arr[j]).attr("expos","0");
                        }
                    }
                }
            }
        };
        //发送分享日志
        function sendSharelogs(){
            var _scrollTop =  document.body.scrollTop,
                _visibleHeight = document.documentElement.clientHeight;
            for(var i=0 ; i < _arr_par.length; i++){
                var par_height = _arr_par[i].offsetHeight;
                var _arrTop = getTop(_arr_par[i]);
                if( (_arrTop + par_height) >= _scrollTop && _arrTop <= (_scrollTop + _visibleHeight)){
                    //console.log($(_arr_par[i]).attr("id"));
                    var sub_arr = $(_arr_par[i]).find(_arr_chi);
                    var _index = $(_arr_par[i]).index() * sub_arr.length;
                    //console.log("ul_index:"+$(_arr_par[i]).index());
                    for(var j=0 ; j < sub_arr.length; j++){
                        var _arrTop2 = getTop(sub_arr[j]);
                        var sub_arr_status = $(sub_arr[j]).attr("expos");
                        if( _arrTop2 >= _scrollTop && _arrTop2 <= _scrollTop+_visibleHeight){
                            //console.log("li:"+( _index+1 + $(sub_arr[j]).index()));
                            //expos 用来记录是否被曝光过，0 是未曝光或已被曝光过并且滑出可视区域，1 是已曝光
                            //如果 元素上 expos 属性不为1 则发送曝光日志
                            if(sub_arr_status !="1"){
                                var dealid = $(sub_arr[j]).attr("data-id") || "";
                                var pos_value = $(sub_arr[j]).attr("data-val") || "";
                                var deals = [{
                                    "id":dealid,
                                    "n":( _index+1 + $(sub_arr[j]).index()),
                                    "time":new Date().getTime(),
                                    "val":pos_value
                                }];
                                deals = encodeURI(JSON.stringify(deals));
                                var data = getShareData(deals);
                                $(sub_arr[j]).find("#exposImg").remove();
                                $(sub_arr[j]).append('<img src="//analysis.tuanimg.com/bgl_v2.gif?'+data+'" id="exposImg">');
                                $(sub_arr[j]).find("#exposImg").hide();
                                $(sub_arr[j]).attr("expos","1");
                            }
                        }else{
                            $(sub_arr[j]).attr("expos","0");
                        }
                    }
                }
            }
        };

        if($.zheui.getUrlKeyVal("share_platform") != ''){
            sendSharelogs();
            $(window).bind("scroll",sendSharelogs);
        }else{
            sendlogs();
            $(window).bind("scroll",sendlogs);
        }
        

        

    }

});
