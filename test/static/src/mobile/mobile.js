/*
* 手机周边页面js代码
* */
define(function (require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");
    require("../common/track");
    //引入曝光统计
    var exposure = require("../common/exposure");

    //置顶功能
    var gotop = require("../common/gotop");
    gotop.init();

    //显示下载浮层
    //var showFloat = require('../common/showFloat');
    //showFloat.showFloat();
    //showFloat.closeOtherFloat();
    var showFloat = require('../common/show_float');
    showFloat.showDownloadGuide();

    var m_list ={};
    m_list.nextpage = false;   //默认是否有下一页


    //手机周边页面数据展示
    m_list.init = function(o){
        m_list.isload = false;      //是否正在加载中
        $.ajax({
            type: "GET",
            url: "/v3/mobile/deals?page="+o+'&per_page=20',
            dataType:"json",
            success: function (data) {
                var objects = data.objects;
                if (objects.length > 0) {
                    m_list.isload = true;      //是否正在加载中
                    m_list.page = o;   //当前第几页
                    $("#loading").hide();
                    $(".loading_more").hide();
                    m_list.nextpage = data.meta.has_next;      //是否有下一页
                    var load_img = "http2://i0.tuanimg.com/ms/zhe800wx/dist/img/img_placehd.png";
                    var objects = data.objects;
                    var list_html = "";
                    var jf_arr0 = [], jf_arr1 = [], jf_arr2 = [], jf_arr3 = [], jf_arr4 = [], jf_arr5 = [];
                    list_html += "<ul class=\"zhe_list\" id=\"zhe_list_" + o + "\">";
                    for (var i = 0; i < objects.length; i++) {
                        var zhuanxiang = objects[i].zhuanxiang;     //手机专享
                        var today = objects[i].today;       //0：旧，1：新（new）
                        var source_type = objects[i].source_type;   //商品来源：1--是商城，0--是淘宝/天猫
                        var shop_type = objects[i].shop_type;   //商铺类型：0--淘宝；1--天猫
                        var deal_type = objects[i].deal_type;
                        var baoyou = objects[i].baoyou;     //包邮
                        var begin_time = objects[i].begin_time.replace("-", "/");     //开始时间
                        begin_time = new Date(begin_time).valueOf();
                        var list_price = objects[i].list_price / 100;     // 原价
                        var price = objects[i].price / 100;       //折扣价
                        var zhekou = (price / list_price * 10).toFixed(1);   //折扣
                        var oos = objects[i].oos;     //0代表未卖光，1代表已卖光
                        var now = new Date().valueOf();
                        var start = false;
                        if (now < begin_time) {
                            start = true;
                        }

                        if(source_type == 1){
                            list_html += "<li data-url='"+$.zheui.domain+"/m/detail/" + objects[i].id + "' data-id='"+objects[i].id+"'>";
                        }else{
                            list_html += "<li data-url=\"" + objects[i].wap_url + "\" data-id=\""+objects[i].id+"\">";
                        }
                        list_html += "<dl class=\"item\">";
                        list_html += "<dt>";
                        list_html += "<img src=\"" + load_img + "\" data-url=\"" + objects[i].square_image + "\" width=\"115\" height=\"80\" alt=\"\">";
                        if (deal_type == 3) {
                            //优品汇
                            list_html += '<div class="icon yph"></div>';
                        }
                        else if (today == 1) {
                            //今日上新
                            list_html += '<div class="icon jrsx"></div>';
                        }
                        list_html += "</dt>";
                        list_html += "<dd>";
                        list_html += "<div class=\"tit_area\">";

                        if (oos == 1) {
                            list_html += "<span class=\"title long\">" + objects[i].short_title + "</span>";
                            list_html += "<div class=\"icon qiangwan\"></div>";
                        } else {
                            if (start) {
                                list_html += "<span class=\"title long\">" + objects[i].short_title + "</span>";
                                list_html += "<div class=\"icon nostart\"></div>";
                            } else {
                                list_html += "<span class=\"title\">" + objects[i].short_title + "</span>";
                            }
                        }
                        list_html += "</div>";
                        list_html += "<div class=\"attr\">";
                        list_html += "<span class=\"price\">￥" + price + "</span>";
                        list_html += "<del>￥" + list_price + "</del>";
                        /*if (source_type == 1) {
                            if (m_list.user_status != null) {
                                var jf = objects[i].scores["z" + m_list.user_status];
                                list_html += "<span class=\"integral\">+" + jf + "积分</span>";
                            } else {
                                for (var j = 0; j < 5; j++) {
                                    eval("jf_arr" + j).push(objects[i].scores["z" + j]);
                                }
                                list_html += "<span class=\"integral\"></span>";
                            }
                        }*/
                        list_html += "</div>";
                        list_html += "<div class=\"attr\">";
                        if (baoyou) {
                            list_html += "<span class=\"discount\"><i class=\"by\">包邮</i></span>";
                        } else {
                            list_html += "<span class=\"discount\"></span>";
                        }
                        list_html += "<span class=\"sale_num\">售出<font class=\"fc_index_orangeRed\">" + objects[i].sales_count + "</font>件</span>";
                        if (source_type == 1) {
                            list_html += "<span class='mail'>特卖商城</span>";
                        } else {
                            if(shop_type == 0){
                                list_html += "<span class='mail'>去淘宝</span>";
                            }
                            if(shop_type == 1){
                                list_html += "<span class='mail'>去天猫</span>";
                            }
                        }
                        list_html += "</div></dd></dl></li>";
                    }
                    list_html += "</ul>";
                    $(".list_main").append(list_html);
                    $(".zhe_list").imglazyload({"imgattr": "data-url"});
                    //曝光统计
                    exposure.exposure_ev($(".zhe_list"),"li");
                    if(!m_list.nextpage){
                        $(".zhe_list_w").append("<div class='list_end'><span></span></div>");
                    }else{
                        if($(".loading_more").length == 0){
                            var html = "<div class=\"loading_more\"><span class=\"loading\">查看更多</span></div>";
                            $("#zhe_list_main").append(html);
                        }else{
                            $(".loading_more").html("<span class=\"loading\">查看更多</span>").show();
                        }
                    }

                    //绑定跳转方法
                    var zhe_list_li = $("#zhe_list_" + o).find("li");
                    $.zheui.bindTouchGoto(zhe_list_li, function (obj) {
                        var url_id = obj.attr("data-url");
                        var dealId = obj.attr("data-id");
                        if (url_id.length > 0) {
                            window.location.href = $.tracklog.outUrl(url_id, {liststatus:1,dealId:dealId});
                        }
                    });

                    if (m_list.user_status == null) {
                        //发送ajax请求，获取用户等级
                        $.ajax({
                            type: "GET",
                            url: "//zapi.zhe800.com/profile/grade?callback=?",
                            dataType: "jsonp",
                            success: function (udata) {
                                if (udata.status == 0) {
                                    m_list.user_status = 0;
                                } else {
                                    m_list.user_status = udata.grade.grade;
                                    if (m_list.user_status > 5) {
                                        m_list.user_status = 5;
                                    }
                                }
                                m_list.js_init($("#zhe_list_" + o), eval("jf_arr" + m_list.user_status));
                            },
                            error: function () {
                                m_list.user_status = 0;
                                m_list.js_init($("#zhe_list_" + o), jf_arr0);
                            }
                        });
                    }
                }else{
                    $("#zhe_list_main").html("<span class='no_list_mes'></span>");
                    $("#loading").hide();
                }
            },
            timeout:20000,
            error:function(){
                if(o == 1){
                    //第一页加载失败处理
                    $("#loading").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading"),function(){
                        $("#loading").html("<span class=\"icon_load\"></span><span class=\"txt\">努力加载中...</span>");
                        m_list.init(1);
                    });
                }else{
                    //后面页加载失败处理
                    $(".loading_more").html("<span class=\"load_fail\">加载失败，点击重新加载</span>");
                    $.zheui.bindTouchGoto($(".loading_more"),function(){
                        m_list.init(o);
                        $(".loading_more").html("<span class=\"load\"><i class=\"icon_load\"></i>加载中......</span>");
                    });
                }
            }
        });
    };

    //初始化，第一页信息
    m_list.init(1);

    //积分赋值
    m_list.js_init = function(o,p){
        for(var i=0; i< p.length; i++){
            o.find(".integral").eq(i).html("+"+p[i]+"积分");
        }
    };

    //绑定加载下一页事件
    $(window).bind("scroll",function(){
        var wh = window.innerHeight;
        var sctop=document.body.scrollTop;
        var pageh = $("#ct").height();
        if((wh+sctop+20)>=pageh){
            if(m_list.nextpage && m_list.isload){
                if($(".loading_more").length == 0){
                    var html = "<div class=\"loading_more\"><span class=\"load\"><i class=\"icon_load\"></i>努力加载中......</span></div>";
                    $(".jingpin_w").append(html);
                }else{
                    $(".loading_more").html("<span class=\"load\"><i class=\"icon_load\"></i>努力加载中......</span>").show();
                }
                var next_page = m_list.page + 1;
                m_list.init(next_page);
            }
        }
    });
});