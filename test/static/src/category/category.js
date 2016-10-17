/**
 * 大类页JS
 * 2016.1.13 zhangpeng01 对于特定浏览器高度发生变化侧栏高度增加
 */
define(function (require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    var track = require("../common/track_v2");
    //初始化htt-header
    track.init("M");
    //添加pos_type和pos_value
    var track_data = {
      pos_value:"jtlst",
      pos_type:"jtlst",

    };
    //将track_data写入cookie
    $.tracklog.addCokkie(track_data);
    var search = require('../search/search');
    var m_search = new search();

    //引入曝光统计
    var exposure = require("../common/exposure");
    //导航滑动
    var iScroll = require("../common/iscroll_extend");

    //搜索输入框
    $("#search_input").bind("focus keyup",function(){
        $("#search_input").animate({
            "width" : "61%"
        }, 500, 'ease-out', function () {
            $("#search_close").show();
        });
        m_search.get_data();
        //点击搜索框打点统计
        $.tracklog.action("search",track_data,"");
    });

    //搜索输入框失去焦点
    $("#search_input").bind("blur",function(){
        m_search.blurr();
    });

    //搜索
    $.zheui.bindTouchGoto($("#search_close"),function(){
        m_search.search_btn();
    });


    /*//搜索关闭按钮
    $.zheui.bindTouchGoto($("#search_close"),function(){
        m_search.close();
        $("#search_close").hide();

        $("#search_input").animate({
            width: "64%"
        }, 500, 'ease-out', function () {
            $("#search_input").val("").blur();
            get_sales_count();
        });
    });*/

    //搜素提交按钮
    $.zheui.bindTouchGoto($(".search_rt"),function(){
        m_search.search_btn();
    });

    //分类页数据显示 user_type:新老用户类型; user_role:用户身份类型
    var user_type = $.cookie.get("user_type") == null? 0:$.cookie.get("user_type");
    var user_role = $.cookie.get("user_role") == null? "":$.cookie.get("user_role");

    //分类
    var category = {};
    category.myscroll = null;
    category.twoHtml = {};
    category.isload = false;

    // 检测是否支持webp
    var isWebp = false;
    $.zheui.check_iswebp(function(i) {
        if ($.os.android) {
            isWebp = i;
        }
    });

    //点击功能封装 去除冒泡阻塞
    function bindTouchEvent ($els, callback) {
        var isMove;
        $els.each(function (index, ele) {
            $(ele).bind({
                "touchstart": function (e) {
                    isMove = false;
                },
                "touchmove": function (e) {
                    isMove = true;
                },
                "touchend": function (e) {
                    if (isMove) {
                        return;
                    }
                    if (typeof callback === "function") {
                        callback($(this), index);
                    }
                }
            });
        });
    }

    function get_category () {
        category.isload = false;

        $.ajax({
            type: "GET",
            url: "/m/tags/v2?user_type=" + user_type + "&user_role=" + user_role + "&vt=" + new Date().getTime(),
            dataType:"json",
            success: function (data) {
                category.isload = true;

                if (data.length > 0) {
                    render_category(data);

                    //一级分类点击
                    bindTouchEvent($("#category_w .leftnav li"), function (element) {
                        var url = element.attr("data-url");

                        $("#category_w .leftnav li a.cur").removeClass("cur");
                        element.find("a").addClass("cur");

                        setTimeout(function() {
                            $('#category_w .category_m ul').hide();
                            $('#category_w .category_m ul[data-parent-url="' + url + '"]').show();

                            var scrollToEle = $('#leftnav li[data-url="' + url + '"]');
                            if (scrollToEle && scrollToEle[0]) {
                                category.myscroll.scrollToElement(scrollToEle[0], 600);
                            }
                        }, 20);

                    });
                    bindTouchEvent($("#category_w .leftnav li"),function(_this){
                        var that = _this;
                        var url = that.attr("data-url");

                        //点击左侧分类tab打点统计
                        var tag_index = $("#category_w .leftnav li").index(that)+1;
                        $.tracklog.action("tag",track_data,"{eventvalue:"+url+",eventindex:"+tag_index+"}");
                    });
                    bindTouchEvent($("#category_m ul li a"),function(_this){
                        var that = _this;
                        if (that.attr("data-val")) {
                            var data_val_arr = that.attr("data-val").split('/');
                            var element_index = $('#category_m ul[data-parent-url="'+ data_val_arr[0] +'"] li a ').index(that)+1;
                            var eventsource = that.attr("data-val").split('/')[0];
                            var eventvalue = that.attr("data-val").split('/')[1];
                            //点击各个分类打点统计
                            $.tracklog.action("jutag2nd",track_data,"{eventvalue:"+eventvalue+",eventsource:"+eventsource+",eventindex:"+element_index+"}");
                        }
                    });
                    // $.zheui.bindTouchGoto($("#category_w .leftnav li"), function(_this) {
                    //         var that = _this;
                    //         var url = that.attr("data-url");

                    //         //点击左侧分类tab打点统计
                    //         var tag_index = $("#category_w .leftnav li").index(that)+1;
                    //         $.tracklog.action("tag",track_data,"{eventvalue:"+url+",eventindex:"+tag_index+"}");
                    // });
                    // $.zheui.bindTouchGoto($("#category_m ul li a"), function(_this) {
                    //         var that = _this;
                    //         if (that.attr("data-val")) {
                    //             var data_val_arr = that.attr("data-val").split('/');
                    //             var element_index = $('#category_m ul[data-parent-url="'+ data_val_arr[0] +'"] li a ').index(that)+1;
                    //             var eventsource = that.attr("data-val").split('/')[0];
                    //             var eventvalue = that.attr("data-val").split('/')[1];
                    //             //点击各个分类打点统计
                    //             $.tracklog.action("jutag2nd",track_data,"{eventvalue:"+eventvalue+",eventsource:"+eventsource+",eventindex:"+element_index+"}");
                    //         }   
                    // });

                    //导航左右滑动
                    setTimeout(function() {
                        var scrollHeight = 0;
                        $(".leftnav li").forEach(function (item) {
                            var $item = $(item);

                            scrollHeight += $item.height() || 51;
                        });
                        scrollHeight += 10;
                        $("#leftnav").height($(window).height() - 53);
                        $("#leftnav_item").height(scrollHeight);

                        category.myscroll = new iScroll("leftnav", {
                            snap: false,
                            momentum: false,
                            vScrollbar:false,
                            hScroll: false,
                            hScrollbar:false,
                            onScrollEnd: function () {}
                        });
                    }, 20);

                    //曝光统计
                    exposure.exposure_ev($("#category_w .leftnav"), "li");

                    $("#category_w").show();
                    $("#loading").hide();
                    //$("#leftnav_item ul li").eq(0).addClass("cur");
                }
                else {
                    $("#loading").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading"),category_again);
                }

                // $(window).resize(function(){
                //     $("#leftnav").height($(window).height() - 53);
                // });
                // 2016.1.13 zhangpeng01 对于特定浏览器高度发生变化侧栏高度增加
                $(window).on("touchmove",function(){             
                    $("#leftnav").height($(window).height() - 53+55); 
                });
            },
            timeout : 20000,
            error : function () {
                $("#loading").text("加载失败，点击重新加载");
                $.zheui.bindTouchGoto($("#loading"),category_again);
            }
        });
    }

    function render_category (data) {
        var list = {}, left = "", right = "", k, index = 0;

        $.each(data, function (o, p) {
            var picUrl = p.pic;

            //不支持webp情况下修改图片格式
            if(!isWebp && picUrl.indexOf('.webp') != -1){
                picUrl = picUrl.replace('.webp','');
            }

            if (p.parent_url_name == "" && p.url_name != "baoyou" && p.url_name != "fengding") {
                if (!list[p.url_name]) {
                    list[p.url_name] = {
                        nav: "<li data-url='" + p.url_name + "' data-id='" + p.id + "' data-val='" + p.url_name + "'>" +
                            "<a #CUR# href='javascript:void(0)' class='" + ((category.cur == p.url_name) ? "cur" : "") + "'>" +
                            p.category_name + "</a></li>",
                        content: []
                    };
                }
                list[p.url_name].content.push(
                    "<li><a href='/m/catelist/" + p.url_name + "?url_name=" + p.url_name + "&category_name=" + encodeURI(p.category_name) +
                    "' data-id='" + p.id + "' data-val='" + p.url_name + "/" + p.url_name + "'><img src='" + picUrl + "' width='50' height='50'>" +
                    "<span>全部</span></a></li>"
                )
                return;
            }
        });

        $.each(data, function (o, p) {
            var picUrl = p.pic;

            //不支持webp情况下修改图片格式
            if(!isWebp && picUrl.indexOf('.webp') != -1){
                picUrl = picUrl.replace('.webp','');
            }

            if (p.parent_url_name && list[p.parent_url_name]) {
                list[p.parent_url_name].content.push(
                    "<li><a href='/m/list/" + p.url_name + "?url_name=" + p.url_name + "&category_name=" + encodeURI(p.category_name) +
                    "&parent_url_name=" + p.parent_url_name + "' data-id='" + p.id + "' data-val='" + p.parent_url_name + "/" + p.url_name + "'>" +
                    "<img src='" + picUrl + "' width='50' height='50'><span>" + p.category_name + "</span></a></li>"
                );
            }
        });

        left += '<ul>';
        for (k in list) {
            left += list[k].nav.replace("#CUR#", index > 0 ? "" : 'class="cur"');

            if (index != 0) {
                right += '<ul data-parent-url="' + k + '" style="display:none;">' + list[k].content.join("") + '<p style="height:53px;clear: both;"></p></ul>';
            }
            else {
                right += '<ul data-parent-url="' + k + '">' + list[k].content.join("") + '<p style="height:53px;clear: both;"></p></ul>';
            }
            index++;
        }
        left += '</ul>';

        $("#leftnav_item").append(left);
        $("#category_m").append(right);
    }

    function get_sales_count () {
        $.ajax({
            type: "GET",
            url: "/v2/deals/count/zaojiuwanba",
            dataType:"json",
            success: function (data) {
                $("#search_input").attr("placeholder", "在" + data.now_count + "款商品中搜索");
            },
            timeout : 20000,
            error : function () {
                $("#search_input").attr("placeholder", "商品分类搜索");
            }
        });
    }

    //页面初始化
    get_sales_count();
    get_category();

    function category_again(){
        $("#loading").html("<span class=\"icon\"></span><span class=\"txt\">努力加载中...</span>");
        get_category();
    }

});



