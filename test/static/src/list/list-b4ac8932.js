/*
 * 列表页代码
 * */
define(function(require, exports, module) {
    //引用外界资源
    var $ = require("zepto");

    require("../common/base");
    require("../common/imglazyload");
    var track = require("../common/track_v2");
    //初始化htt-header
    track.init("M");
    //添加pos_type和pos_value
    var track_data = {
      pos_value:"jutag_"+window.location.pathname.split('/')[3],
      pos_type:"jutag",

    };
    //将track_data写入cookie
    $.tracklog.addCokkie(track_data);

    //置顶功能
    var gotop = require("../common/gotop");
    gotop.init();

    //显示下载浮层
    //var showFloat = require('../common/showFloat');
    //showFloat.showFloat();
    //showFloat.closeOtherFloat();
    var showFloat = require('../common/show_float');
    showFloat.showDownloadGuide();


    //引入曝光统计
    var exposure = require("../common/exposure");


    var m_list = {};
    var zhe_list_li = $("#zhe_list_main").find("li");
    $.zheui.bindTouchGoto(zhe_list_li, function(obj) {
        var url_id = obj.attr("data-url");
        var dealId = obj.attr("data-id");
        if (url_id.length > 0) {
            window.location.href = url_id;
        }
    });
    m_list.nextpage = hasNext; //默认是否有下一页

    //user_type:新老用户类型; user_role:用户身份类型
    m_list.user_type = $.cookie.get("user_type") == null ? 0 : $.cookie.get("user_type");
    m_list.user_role = $.cookie.get("user_role") == null ? "" : $.cookie.get("user_role");
    m_list.category_name = $.zheui.getUrlKeyVal("category_name"); //分类名称

    //初始化的时候获取的值
    m_list.data_init = {};
    //tag_url:商品所属分类   parent_url_name:当前分类的上级分类  order:排序规则  shop_type：商品类型；1代表天猫，0代表淘宝，4代表特卖商城
    m_list.data_init.tag_url = $.zheui.getUrlKeyVal("url_name");
    m_list.data_init.parent_url_name = $.zheui.getUrlKeyVal("parent_url_name");
    m_list.data_init.shop_type = $.zheui.getUrlKeyVal("shop_type");
    //是否特卖商城
    var is_special_shop = false;
    if (location.href.indexOf('&shop_type=4') != -1) {
        is_special_shop = true;
        $(".change_select").hide();
    }
    m_list.data_init.path_url = window.location.pathname.substr(8);


	//拼接筛选数据
    m_list.change_data_init = function (o, p) {
    	m_list.data_init[o] = p;
    };

	//积分赋值
    m_list.js_init = function (o, p) {
    	for (var i = 0; i < p.length; i++) {
    		o.find(".integral").eq(i).html("+" + p[i] + "积分");
    	}
    };
	//今日更新
    m_list.reload = function () {
    	$("#zhe_list_main").html(""); //去掉当前列表数据
    	$(".loading_more").hide();
    	$(".list_end").hide();
    	$("#loading").show();
    	m_list.init(1);
    };

    //初始化，第一页信息 并 判断是否是“今日更新”
    var time_type = $.zheui.getUrlKeyVal("time");
    if (m_list.data_init.tag_url == 'baoyou' || m_list.data_init.tag_url == 'mobile') {
        m_list.data_init.flag = 1;
    }
    var four_flag = time_type == "today" || is_special_shop || m_list.data_init.tag_url == 'mobile' || m_list.data_init.tag_url == 'baoyou';
    //topbar 显示
    if (m_list.category_name.length > 0) {
        if (m_list.data_init.parent_url_name.length > 0) {
            $(".topbar .title .tt_left").css({
                "background": "url(//i0.tuanimg.com/ms/zhe800m/static/img/cate/" + m_list.data_init.parent_url_name + "_w.png)",
                "background-size": "22px auto"
            });
        } else {
            $(".topbar .title .tt_left").css({
                "background": "url(//i0.tuanimg.com/ms/zhe800m/static/img/cate/" + m_list.data_init.tag_url + "_w.png)",
                "background-size": "22px auto"
            });
        }
        if (four_flag) {
            $(".topbar .title span label").html('全部分类');
            $('c').css("display", "inline-block");
            $("#zhe_list_main").empty().show();
            $('#zhe_list_bg').show().css('background-color', 'rgba(0,0,0,0)');
        } else {
            $('#zhe_list_bg').show().css('background-color', 'rgba(0,0,0,0)');
            $("#zhe_list_main").show();
            $(".topbar .title span label").html(m_list.category_name);
            m_list.data_init.url_name = m_list.data_init.tag_url;
        }

        $(".topbar .title .tt_right").css("display", "inline-block");
    }

    // 首页列表第一页数据处理
    //初始化页面高度
    var win_height = window.innerHeight;
    $(".zhe_list_w").css("min-height", win_height - 44 + "px");
    $(".zhe_list").imglazyload({
        "imgattr": "data-url"
    });
    //第一页数据曝光
    exposure.exposure_ev($("#zhe_list_1"), "li");

    // 第一页选中效果
    $.zheui.bindTouchGoto($("#zhe_list_1 li"));

    //为同步数据更换out链接
    var href_new;
    if($.zheui.newGetUrlKeyVal("share_Type") != ''){
        $.each($("#zhe_list_1").find("li"), function(o, p) {
                href_new = $.tracklog.outShareUrl($(p).attr("data-url"), {
                    liststatus: 1,
                    dealId: $(p).attr("data-id")
                }); 
            p.setAttribute("data-url", href_new);
        });
    }else{
        $.each($("#zhe_list_1").find("li"), function(o, p) {
                href_new = $.tracklog.outUrl($(p).attr("data-url"), {
                    liststatus: 1,
                    dealId: $(p).attr("data-id")
                }); 
            p.setAttribute("data-url", href_new);
        });
    }
    $.each($("#zhe_list_1").find("li"), function(o, p) {
       
            href_new = $.tracklog.outShareUrl($(p).attr("data-url"), {
                liststatus: 1,
                dealId: $(p).attr("data-id")
            }); 
        p.setAttribute("data-url", href_new);
    });
    m_list.page = 1;
    m_list.isload = true; //初始化是否正在加载中
    get_select_history(); //根据记录历史初始化筛选样式
    //分类数组组装处理
    function category_data_handle(data_origin, null_obj) {
        var data = data_origin;
        if (data_origin.length % 4 != 0) {
            if (data_origin.length > 4) {
                for (var i = 0; i < data_origin.length % 4; i++) {
                    data.push(null_obj);
                }
            } else if (data_origin.length < 4) {
                for (var i = 0; i < 4 - data_origin.length; i++) {
                    data.push(null_obj);
                }
            }
        }
        console.log(data);
        var row = data.length / 4,
            html = '';
        for (var j = 0; j < row; j++) {
            var row_arry = [];
            row_arry = data.splice(0, 4);
            if (m_list.data_init.tag_url == 'baoyou') {
                html = '<li><span id=' + row_arry[0].dis_id + '>' + row_arry[0].name_chn + '</span><span id=' + row_arry[1].dis_id + '>' + row_arry[1].name_chn + '</span><span id=' + row_arry[2].dis_id + '>' + row_arry[2].name_chn + '</span><span id=' + row_arry[3].dis_id + '>' + row_arry[3].name_chn + '</span></li>';
            } else if (m_list.data_init.tag_url == 'mobile') {
                html = '<li><span id=' + row_arry[0].mobile_url_name + '>' + row_arry[0].name + '</span><span id=' + row_arry[1].mobile_url_name + '>' + row_arry[1].name + '</span><span id=' + row_arry[2].mobile_url_name + '>' + row_arry[2].name + '</span><span id=' + row_arry[3].mobile_url_name + '>' + row_arry[3].name + '</span></li>';
            } else if (time_type == "today") {
                html = '<li><span id=' + row_arry[0].url_name + '>' + row_arry[0].category_name + '</span><span id=' + row_arry[1].url_name + '>' + row_arry[1].category_name + '</span><span id=' + row_arry[2].url_name + '>' + row_arry[2].category_name + '</span><span id=' + row_arry[3].url_name + '>' + row_arry[3].category_name + '</span></li>';
            } else if (is_special_shop) {
                html = '<li><span id=' + row_arry[0].url_name + '>' + row_arry[0].category_name + '</span><span id=' + row_arry[1].url_name + '>' + row_arry[1].category_name + '</span><span id=' + row_arry[2].url_name + '>' + row_arry[2].category_name + '</span><span id=' + row_arry[3].url_name + '>' + row_arry[3].category_name + '</span></li>';
            }
            if ($(".fenlei").children().length != row) {
                $(".fenlei").append(html);
            }
        }
        if (history.state) {
            for (var dis in history.state) {
                if (dis == 'dis_id' && history.state.dis_id != 'all_category') {
                    $('#' + history.state.dis_id).addClass("span_color");
                    o = $('#' + history.state.dis_id);
                    var other = o.siblings().concat(o.parent().siblings().children());
                    $(other).removeClass('span_color');
                    $('.topbar .title span label').empty().html(history.state.category_name);
                    m_list.data_init.url_name = $('.span_color').attr('id');
                } else if (history.state.dis_id == 'all_category') {
                    $('#all_category').addClass("span_color").siblings('span').removeClass('span_color');
                }
            }
        } else {
            $('#all_category').addClass("span_color").siblings('span').removeClass('span_color');
        }
        m_list.init(1);
    };



    var url, category_url;
    if (time_type == "today") {
        category_url = "/v6/tags?" + "user_type=" + m_list.user_type + "&user_role=" + m_list.user_role;
    } else if (is_special_shop) {
        category_url = "/v6/tags?" + "user_type=" + m_list.user_type + "&user_role=" + m_list.user_role;
    } else if (m_list.data_init.tag_url == 'mobile') {
        category_url = "/m/api/tags/mobile";
    } else if (m_list.data_init.tag_url == 'baoyou') {
        category_url = "/m/api/tags/baoyou" + "&user_type=" + m_list.user_type + "&user_role=" + m_list.user_role;
    }
    get_category();

    function get_category() {
        if (category_url && $(".fenlei").children().length == 0) {
            $.ajax({
                type: "GET",
                url: category_url,
                dataType: "json",
                data: m_list.data_init,
                success: function(data) {
                    //分类span
                    var all_obj, null_obj;
                    if (m_list.data_init.tag_url == 'baoyou') {
                        all_obj = {
                            "dis_id": 'all_category',
                            "id": '',
                            "name_chn": "全部分类"
                        };
                        null_obj = {
                            "dis_id": '',
                            "id": '',
                            "name_chn": ""
                        };
                        data.unshift(all_obj);
                        category_data_handle(data, null_obj);
                    } else if (m_list.data_init.tag_url == 'mobile') {
                        all_obj = {
                            "id": '',
                            "mobile_url_name": "all_category",
                            "name": "全部分类"
                        };
                        null_obj = {
                            "id": '',
                            "mobile_url_name": "",
                            "name": ""
                        };
                        data.unshift(all_obj);
                        category_data_handle(data, null_obj);
                    } else if (time_type == "today") {
                        var one_list_today = [];
                        $.each(data, function(index, item) {
                            if (item.parent_url_name == "") {
                                one_list_today.push(item);
                            }
                        });
                        all_obj = {
                            "id": '',
                            "tag_id": '',
                            "parent_url_name": "",
                            "category_name": "全部分类",
                            "url_name": "all_category",
                            "category_desc": "",
                            "query": "",
                            "pic": "",
                            "now_count": ''
                        };
                        null_obj = {
                            "id": '',
                            "tag_id": '',
                            "parent_url_name": "",
                            "category_name": "",
                            "url_name": "",
                            "category_desc": "",
                            "query": "",
                            "pic": "",
                            "now_count": ''
                        };
                        one_list_today.unshift(all_obj);
                        category_data_handle(one_list_today, null_obj);
                    } else if (is_special_shop) {
                        var one_list = [];
                        $.each(data, function(index, item) {
                            if (item.parent_url_name == "") {
                                one_list.push(item);
                            }
                        });
                        all_obj = {
                            "id": '',
                            "tag_id": '',
                            "parent_url_name": "",
                            "category_name": "全部分类",
                            "url_name": "all_category",
                            "category_desc": "",
                            "query": "",
                            "pic": "",
                            "now_count": ''
                        };
                        null_obj = {
                            "id": '',
                            "tag_id": '',
                            "parent_url_name": "",
                            "category_name": "",
                            "url_name": "",
                            "category_desc": "",
                            "query": "",
                            "pic": "",
                            "now_count": ''
                        };
                        one_list.unshift(all_obj);
                        category_data_handle(one_list, null_obj);
                    }

                },
                timeout: 20000,
                error: function() {

                }
            });
        }
    }

    //列表页异步数据展示
    m_list.init = function(o) {
        m_list.isload = false; //是否正在加载中
        if (time_type == "today") {
            url = "/m/api/deals/today?per_page=20&image_type=small&image_model=jpg&page=" + o + "&user_type=" + m_list.user_type + "&user_role=" + m_list.user_role;
        } else if (is_special_shop) {
            url = "/m/api/deals/market?per_page=20&image_type=small&image_model=jpg&page=" + o + "&user_type=" + m_list.user_type + "&user_role=" + m_list.user_role;
        } else if (m_list.data_init.tag_url == 'mobile') {
            var agentInfo = navigator.userAgent;
            if (/iphone os/gi.test(agentInfo)) {
                m_list.platform = "iphone";
            } else if (/android/gi.test(agentInfo)) {
                m_list.platform = "android";
            }
            url = "/m/api/deals/mobile?per_page=20&image_type=small&image_model=jpg&page=" + o + "&user_type=" + m_list.user_type + "&user_role=" + m_list.user_role + "&platform=" + m_list.platform;
        } else if (m_list.data_init.tag_url == 'baoyou') {
            url = "/m/api/deals/baoyou?per_page=20&image_type=small&image_model=jpg&page=" + o + "&user_type=" + m_list.user_type + "&user_role=" + m_list.user_role;
        } else {
            url = "/m/api/list/" + m_list.data_init.path_url + "?per_page=20&image_type=small&image_model=jpg&page=" + o + "&user_type=" + m_list.user_type + "&user_role=" + m_list.user_role;
        }
        console.log("init",url);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            data: m_list.data_init,
            success: function(data) {
                $('#zhe_list_bg').hide().css('background-color', 'rgba(0,0,0,0.6)');
                var objects = data.objects;
                //console.log(objects);
                if (objects && objects.length > 0) {
                    m_list.isload = true; //是否正在加载中
                    m_list.page = o; //当前第几页
                    $(".loading_more").hide();
                    m_list.nextpage = data.meta.has_next; //是否有下一页
                    var load_img = "//i0.tuanimg.com/ms/zhe800wx/dist/img/img_placehd.png";
                    var list_html = "";
                    var jf_arr0 = [],
                        jf_arr1 = [],
                        jf_arr2 = [],
                        jf_arr3 = [],
                        jf_arr4 = [],
                        jf_arr5 = [];
                    list_html += "<ul class=\"zhe_list\" id=\"zhe_list_" + o + "\">";
                    for (var i = 0; i < objects.length; i++) {
                        var zhuanxiang = objects[i].zhuanxiang; //手机专享
                        var today = objects[i].today; //0：旧，1：新（new）
                        var source_type = objects[i].source_type; //商品来源 ：1--是商城，0--是淘宝/天猫
                        var shop_type = objects[i].shop_type; //商铺类型：0--淘宝；1--天猫
                        var deal_type = objects[i].deal_type;
                        var brand_product_type = objects[i].brand_product_type;
                        var baoyou = objects[i].baoyou; //包邮
                        var begin_time = objects[i].begin_time.replace("-", "/"); //开始时间
                        begin_time = new Date(begin_time).valueOf();
                        var list_price = objects[i].list_price / 100; // 原价
                        var price = objects[i].price / 100; //折扣价
                        var zhekou = (price / list_price * 10).toFixed(1); //折扣
                        var oos = objects[i].oos; //0代表未卖光，1代表已卖光
                        var brand_id = objects[i].brand_id; //品牌团id
                        var now = new Date().valueOf();
                        var start = false;
                        if (now < begin_time) {
                            start = true;
                        }
                        var url = "";
                        if (source_type == 1) {
                            if($.zheui.newGetUrlKeyVal("share_Type") != ''){
                                url = $.tracklog.outShareUrl($.zheui.domain + "/m/detail/" + objects[i].id, {
                                    liststatus: 1,
                                    dealId: objects[i].id
                                });
                            }else{
                                url = $.tracklog.outUrl($.zheui.domain + "/m/detail/" + objects[i].id, {
                                    liststatus: 1,
                                    dealId: objects[i].id
                                });
                            }
                        } else {
                            if($.zheui.newGetUrlKeyVal("share_Type") != ''){
                                url = $.tracklog.outShareUrl(objects[i].wap_url, {
                                    liststatus: 1,
                                    dealId: objects[i].id
                                });
                            }else{
                                url = $.tracklog.outUrl(objects[i].wap_url, {
                                    liststatus: 1,
                                    dealId: objects[i].id
                                });
                            }

                        }
                        if (m_list.data_init.tag_url == "all" || m_list.data_init.tag_url == "baoyou") {
                            list_html += "<li data-url='" + url + "' data-id='" + objects[i].id + "'><a href='javascript:void(0);'>";
                        } else {
                            if (brand_id > 0) {
                                //补足进入品牌团列表页参数
                                list_html += "<li data-url='/m/brand/list?brand_id=" + brand_id + "&include_deal_id=" + objects[i].id + "' data-id='" + objects[i].id + "'><a href='javascript:void(0);'>";
                                //品牌团
                                list_html += '<div class="icon pptm" ></div>';
                            } else {
                                list_html += "<li data-url='" + url + "' data-id='" + objects[i].id + "'><a href='javascript:void(0);'>";
                            }
                        }

                        list_html += "<dl class=\"item\">";
                        list_html += "<dt>";
                        if (time_type == "today" || is_special_shop || m_list.data_init.tag_url == 'mobile' || m_list.data_init.tag_url == 'baoyou') {
                            list_html += "<img src=\"" + load_img + "\" data-url=\"" + objects[i].square_image + "\" width=\"130\" height=\"130\" alt=\"\">";
                        } else {
                            list_html += "<img src=\"" + load_img + "\" data-url=\"" + objects[i].square_image + "\" width=\"130\" height=\"130\" alt=\"\">";
                        }
                        if (brand_id > 0) {
                            //品牌团
                            list_html += '<div class="icon pptm" ></div>';
                        }
                        /*else if (deal_type == 2) {
                            //主题馆
                            list_html += '<div class="icon ztg" data-url="http://h5.m.zhe800.com/m/seoview?id=' + objects[i].id + '&url_name=' + m_list.data_init.tag_url + '"></div>';
                        }*/
                        if (deal_type == 3) {
                            //优品汇
                            list_html += '<div class="icon yph" ></div>';
                        } else if (today == 1) {
                            //今日上新
                            list_html += '<div class="icon jrsx" ></div>';
                        }
                        list_html += "</dt>";
                        list_html += "<dd>";
                        list_html += "<div class=\"tit_area\">";

                        if (oos == 1) {
                            list_html += "<span class=\"title longbig\">" + objects[i].short_title + "</span>";
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
                            if (shop_type == 0) {
                                list_html += "<span class='mail'>去淘宝</span>";
                            }
                            if (shop_type == 1) {
                                list_html += "<span class='mail'>去天猫</span>";
                            }
                        }
                        list_html += "</div></dd></dl></a></li>";
                    }
                    list_html += "</ul>";
                    $("#loading_init").hide();
                    if (four_flag&&o == 1) {
                        $("#zhe_list_main").empty().append(list_html);
                    } else if(o == 1){
                        $("#zhe_list_main").empty().append(list_html);
                    }else{
                        $("#zhe_list_main").append(list_html);
                    }

                    $("#loading").hide();
                    $("#clist_main").show();
                    $(".zhe_list").imglazyload({
                        "imgattr": "data-url"
                    });
                    //曝光统计
                    exposure.exposure_ev($("#zhe_list_main > ul"), "li");
                    if (!m_list.nextpage) {
                        if ($(".list_end").length) {
                            $(".list_end").show();
                        } else {
                            $(".zhe_list_w").append("<div class='list_end'><span></span></div>");
                        }
                    } else {
                        if ($(".loading_more").length == 0) {
                            var html = "<div class=\"loading_more\"><span class=\"loading\">查看更多</span></div>";
                            $("#zhe_list_main").append(html);
                        } else {
                            $(".loading_more").html("<span class=\"loading\">查看更多</span>").show();
                        }
                    }

                    //页面高度控制
                    var win_height = window.innerHeight;
                    var ct_height = parseInt($("#ct").css("height"));
                    if (ct_height < win_height) {
                        $(".zhe_list_w").css("height", win_height - 44 + "px");
                    }

                    //触发异步数据选中效果
                    var zhe_list_li = $("#zhe_list_" + o).find("li");
                    $.zheui.bindTouchGoto(zhe_list_li);
                    if (m_list.user_status == null) {
                        //发送ajax请求，获取用户等级
                        $.ajax({
                            type: "GET",
                            //url: $.zheui.protocol+"//zapihs.zhe800.com/profile/grade?callback=?",
                            url: $.zheui.protocol + "//zapi.zhe800.com/profile/grade?callback=?",
                            dataType: "jsonp",
                            success: function(udata) {
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
                            error: function() {
                                m_list.user_status = 0;
                                m_list.js_init($("#zhe_list_" + o), jf_arr0);
                            }
                        });
                    }
                } else {
                    //页面高度控制
                    var win_height = window.innerHeight;
                    //$(".btn_filter").unbind();
                    $("#zhe_list_main").html("<span class='no_list_mes'></span>");
                    $("#loading").hide();
                    $("#clist_main").show();
                }
            },
            timeout: 20000,
            error: function() {
                if (o == 2) {
                    //第一页异步数据加载失败处理
                    $("#loading").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading"), function() {
                        $("#loading").html("<span class=\"icon\"></span><span class=\"txt\">努力加载中...</span>");
                        m_list.init(2);
                    });
                } else {
                    //后面页加载失败处理
                    $(".loading_more").html("<span class=\"load_fail\">加载失败，点击重新加载</span>");
                    $.zheui.bindTouchGoto($(".loading_more"), function() {
                        m_list.init(o);
                        $(".loading_more").html("<span class=\"loading\"><i class=\"icon_load\"></i>加载中......</span>");
                    });
                }
            }
        });
    };

    //绑定加载下一页事件
    $(window).bind("scroll", function() {
        var wh = window.innerHeight;
        var sctop = document.body.scrollTop;
        var pageh = $("#ct").height();
        if ((wh + sctop + 20) >= pageh) {
            if (m_list.nextpage && m_list.isload) {
                if ($(".loading_more").length == 0) {
                    var html = "<div class=\"loading_more\"><span class=\"loading\"><i class=\"icon_load\"></i>加载中......</span></div>";
                    $("#zhe_list_main").append(html);
                } else {
                    $(".loading_more").html("<span class=\"loading\"><i class=\"icon_load\"></i>加载中......</span>").show();
                }
                var next_page = m_list.page + 1;
                m_list.init(next_page);
            } else if (!m_list.nextpage) {
                $(".loading_more").html("<span class=\"loading\">没有更多啦~</span>");
            }
        }
    });
    //分类span
    var window_height = $(window).height();
    var div_height = $('#list_select_left').height();
    $.zheui.bindTouchGoto($(".topbar .title span"), function(o) {
        if ($(".list_new_category").css("display") == "block") {
            $("#zhe_list_bg1").hide();
            $(".list_new_category").hide();
            if (flag) {
                $(".btn_filter").children('o').css("background-position", "-11px -10px");
            } else {
                $(".btn_filter").removeClass('nav_on');
                $(".btn_filter").children('o').css("background-position", "-21px -10px");
            }
            $('#list_select_left').css('height', 'auto');
        }
        if ($(".fenlei").css("display") == "none") {
            $("#zhe_list_bg1").show();
            $(".fenlei").show("slow");
            $('c').css("background-position", "0px 0px");
            $('#list_select_left').css('height', window_height + 'px');
        } else {
            $("#zhe_list_bg1").hide();
            $(".fenlei").hide();
            $('c').css("background-position", "0px -9px");
            $('#list_select_left').css('height', 'auto');
        }
    });
    //区分今日更新 特卖商城 8.8包邮 手机周边
    if (four_flag) {
        $('.fenlei').css('cursor', 'pointer');
        $(".fenlei span").live('click', function() {
            //pv uv 统计
            a();
            $('#list_select_left').css('height', 'auto');
            o = $(this);
            if (o.html()) {
                o.addClass("span_color");
                $('.topbar .title span label').empty().html(o.html());
                var other = o.siblings().concat(o.parent().siblings().children());
                $(other).removeClass('span_color');
                if (o.attr('id') == 'all_category') {
                    m_list.data_init.url_name = '';
                } else {
                    m_list.data_init.url_name = o.attr('id');
                }
                //var push_data = {};
                //if (history.state) {
                //    push_data = {
                //        dis_id: m_list.data_init.url_name,
                //        category_name: o.html(),
                //        shop_type_id: $('.btn_select').attr('id'),
                //        f_price: $("#f_price").val(),
                //        h_price: $("#h_price").val()
                //    }
                //} else {
                //    push_data = {
                //        dis_id: m_list.data_init.url_name,
                //        category_name: o.html()
                //    }
                //}
                //history.replaceState(push_data, '', [location.href]);



            	// #108492 记录列表页排序选项。
                set_select_history(m_list.data_init.url_name, o.html());

                $(".fenlei").hide();
                $('body').css('overflow', 'auto');
                $("#zhe_list_bg1").hide();
                $('c').css("background-position", "0px -9px");
                m_list.init(1);
            }
        });
    } else {
        m_list.init(1);
    }
    //添加统计的方法
    function c(f) {
        var e = document.createElement("img"),
            t = Date.parse(new Date()),
            g = "//analysis.tuanimg.com/panda/panda_w0.gif?t=" + t + "." + Math.random() * 10000000 + "",
            h = [];
        for (var d in f) {
            if (f.hasOwnProperty(d)) {
                h.push(d + "=" + f[d]);
            }
        }
        e.src = g + h.join("&");
        e.onload = function() {
            $(this).remove();
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
    var flag = false;
    //all 天猫 淘宝 选项 记住选项
    function get_select_history() {
        if (history.state) {
            for (var item in history.state) {
                if (item == 'shop_type_id') {
                    if (history.state.shop_type_id != 'all') {
                        flag = true;
                        $(".btn_filter").addClass('nav_on').children('o').css("background-position", "-11px -10px");
                        $('#' + history.state.shop_type_id.toString()).addClass('btn_select').siblings('.shop_type').removeClass('btn_select');
                        m_list.data_init.shop_type = $('#' + history.state.shop_type_id.toString()).attr('data_type');
                    } else {
                        $("#all").addClass('btn_select').siblings('.shop_type').removeClass('btn_select');
                    }
                }
                if (item == 'f_price' && history.state.f_price != '') {
                    flag = true;
                    $(".btn_filter").addClass('nav_on').children('o').css("background-position", "-11px -10px");
                    $('#f_price').val(history.state.f_price.toString());
                    m_list.data_init.min_price = parseInt(history.state.f_price) * 100;
                }
                if (item == 'h_price' && history.state.h_price != '') {
                    flag = true;
                    $(".btn_filter").addClass('nav_on').children('o').css("background-position", "-11px -10px");
                    $('#h_price').val(history.state.h_price.toString());
                    m_list.data_init.max_price = parseInt(history.state.h_price) * 100;
                }
            	// #108492 恢复记录列表页排序选项
                if (item === 'sort') {
                	var sort = (history.state.sort + '').split(' '), type = sort[1], $selected;
                	sort = parseInt(sort[0]);

                	if (($selected = $('.no_filter[data_type="' + sort + '"]')) && $selected.length) {
                		$('.no_filter').removeClass('nav_on').removeClass('price_top').removeClass('price_down');
                		$selected.addClass('nav_on');
                		if (sort === 3) {
                			$selected.addClass(type === 'desc' ? 'price_down' : 'price_top');
                		}
                	}
                	switch (sort) {
                		case 2:
                			m_list.change_data_init('order', 'saled');
                			break;
                		case 3:
                			if (type === 'desc')
                				m_list.change_data_init('order', 'priced');
                			else
                				m_list.change_data_init('order', 'price');
                			break;
                		case 4:
                			m_list.change_data_init('order', 'publishTime');
                			break;
                		default:
                			m_list.change_data_init('order', '');
                			break;
                	}

                }
            }
        }
    }

	// #108492 记录列表页排序选项，将记录功能合并到此函数。
    function set_select_history(dis_id, category_name) {
    	var $sort = $('.no_filter.nav_on'), sort = $sort.attr('data_type') || '1';
    	if ($sort.hasClass('price_top')) {
    		sort += ' asc';
    	} else if ($sort.hasClass('price_down')) {
    		sort += ' desc';
    	}
    	var push_data = {
    		f_price: $("#f_price").val(),
    		h_price: $("#h_price").val(),
    		sort: sort
    	};
    	if (history.state) {
    		push_data.shop_type_id =  $('.btn_select').attr('id');
    		push_data.dis_id =dis_id;
    		push_data.category_name = category_name;
    	}
    	history.replaceState(push_data, '', [location.href]);
    }
    //筛选按钮
    $.zheui.bindTouchGoto($(".btn_filter"), function(o) {
        //多此点击筛选对历史进行判断
        get_select_history();
        //pv uv统计
        a();
        $("#f_price").blur();
        $("#h_price").blur();
        if ($(".list_new_category").css("display") == "none") {
            $("#zhe_list_bg1").show();
            $(".list_new_category").show("slow");
            o.addClass('nav_on');
            o.children('o').css("background-position", "-21px 1px");
            $('#list_select_left').css('height', window_height + 'px');
        } else {
            $("#zhe_list_bg1").hide();
            $(".list_new_category").hide();
            if (flag) {
                o.children('o').css("background-position", "-11px -10px");
            } else {
                o.removeClass('nav_on');
                o.children('o').css("background-position", "-21px -10px");
            }
            $('#list_select_left').css('height', 'auto');
        }
        return false;
    });

    //nav选项 1：默认，2：销量，3：价格，4：最新  传空--默认排序；price--价格升序； priced--降序；今日最新（时间倒序）--publishTime; saled--销量降序；
    $.zheui.bindTouchGoto($("#zhe_list_nav_b ul li span"), function(o, p) {
        //pv uv统计
        $('#list_select_left').css('height', 'auto');
        a();
        var $this = o;
        var data_type = $this.attr("data_type");

        if ((!$this.hasClass("nav_on") || data_type == "3") && data_type != "5") {
            if ($(".list_new_category").css("display") == "block") {
                $("#zhe_list_bg1").hide();
                $(".list_new_category").hide();
                if (flag) {
                    $(".btn_filter").children('o').css("background-position", "-11px -10px");
                } else {
                    $(".btn_filter").removeClass('nav_on');
                    $(".btn_filter").children('o').css("background-position", "-21px -10px");
                }
            }
            $(".no_filter").removeClass("nav_on");
            if (data_type != "3") {
                $(".no_filter").removeClass("price_down price_top");
            }
            $this.addClass("nav_on");
            if (data_type == "1") {
                m_list.change_data_init("order", "");
                // if (m_list.data_init.tag_url == 'baoyou' || m_list.data_init.tag_url == 'mobile') {
                //     m_list.data_init.flag = 1;
                // }
            }
            if (data_type == "2") {
                m_list.change_data_init("order", "saled");
            }
            if (data_type == "3") {
                $this.addClass("price_down");
                if ($this.hasClass("price_top")) {
                    $this.removeClass("price_top");
                    m_list.change_data_init("order", "priced");
                } else {
                    $this.addClass("price_top");
                    m_list.change_data_init("order", "price");
                }
            }
            if (data_type == "4") {
                m_list.change_data_init("order", "publishTime");
            }

        	// #108492 记录列表页排序选项。
            set_select_history(m_list.data_init.url_name, $(".span_color").html());

            //如果默认flag=1 否则flag=0
            var moren = $('#zhe_list_nav_b li')[0];
            if (!$(moren).children().hasClass('nav_on')) {
                m_list.data_init.flag = 0;
            } else {
                m_list.data_init.flag = 1;
            }
            $("#zhe_list_main").html(""); //去掉当前列表数据
            $(".loading_more").hide();
            $(".list_end").hide();
            $("#loading").show();
            m_list.init(1);
        }
        //点击页面排序按钮打点统计
        switch(data_type){
            case "1":
                $.tracklog.action("order",track_data,"{eventvalue:default}");
                break;
            case "2":
                $.tracklog.action("order",track_data,"{eventvalue:saled}");
                break;
            case "3":
                if($this.hasClass("price_top")){
                    $.tracklog.action("order",track_data,"{eventvalue:price}");
                    break;
                }
                else{
                    $.tracklog.action("order",track_data,"{eventvalue:priced}");
                    break;
                }
            case "4":
                $.tracklog.action("order",track_data,"{eventvalue:publishTime}}");
                break;
            default:
        }
    });

    //分类筛选
    //$.zheui.bindTouchGoto($(".topbar .title"), get_category_list);

    function get_category_list() {
        // $("#ct").css("min-height","510px");
        if ($("#zhe_list_bg").css("display") == "none") {
            $("#zhe_list_bg").show();
            if ($(".quarter").length > 0) {
                $("#list_cty_main").show();
            } else {
                $.ajax({
                    type: "GET",
                    url: "/v6/tags?user_type=" + m_list.user_type + "&user_role=" + m_list.user_role + "&vt=" + new Date().getTime(),
                    dataType: "json",
                    success: function(data) {
                        if (data.length > 0) {
                            m_list.fenlei_data = data; //分类数据
                            var html = "";
                            html += "<div class='quarter' category_name='全部' url_name='all'><img src='//i0.tuanimg.com/ms/zhe800m/static/img/cate/all_o.png' width='50' height='50'><span class='name'>全部</span><div class='trigon'></div></div>";
                            $.each(data, function(o, p) {
                                if (p.parent_url_name == "" && p.url_name != "fengding") {
                                    html += "<div class='quarter' category_name='" + p.category_name + "' url_name='" + p.url_name + "'>";
                                    html += "<img src='//i0.tuanimg.com/ms/zhe800m/static/img/cate/" + p.url_name + ".png' width='50' height='50'>";
                                    html += "<span class='name'>" + p.category_name + "</span>";
                                    html += "<div class='trigon'></div></div>";
                                }
                            });
                            $("#list_cty_wait").hide();
                            $("#list_cty_main").append(html).show();

                            //页面高度控制
                            var win_height = window.innerHeight;
                            var ct_height = parseInt($(".list_cty").css("height"));
                            if (ct_height > win_height) {
                                $(".zhe_list_w").css("min-height", ct_height + 44 + "px");
                            }

                            var url_name_arr = []; //all名称
                            $(".quarter").each(function() {
                                url_name_arr.push($(this).attr("url_name"));
                            });
                            var quarter_4 = Math.ceil($(".quarter").length / 4);
                            for (var i = 0; i < quarter_4; i++) {
                                if (i == quarter_4 - 1) {
                                    //最后一行
                                    var h_class = url_name_arr.slice(i * 4, url_name_arr.length).join(" ");
                                    $("#list_cty_main").append("<div class=\"half " + h_class + "\"></div>");
                                } else {
                                    var h_class = url_name_arr.slice(i * 4, (i + 1) * 4).join(" ");
                                    $($(".quarter").get((i + 1) * 4)).before("<div class=\"half " + h_class + "\"></div>");
                                }
                            }

                            //分类筛选按钮绑定方法
                            $.zheui.bindTouchGoto($(".quarter"), get_level2);

                        } else {
                            $("#list_cty_wait").text("加载失败，点击重新加载");
                            $.zheui.bindTouchGoto($("#list_cty_wait"), get_category_list);
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        $("#list_cty_wait").text("加载失败，点击重新加载");
                        $.zheui.bindTouchGoto($("#list_cty_wait"), get_category_list);
                    }
                });
            }
        } else {
            $("#zhe_list_bg").hide();
            $(".zhe_list_w").css("min-height", "auto");
        }
    }

    //获取2级分类信息
    function get_level2(o) {
        var url_name = o.attr("url_name");
        var category_name = o.attr("category_name");
        var has_lel2 = true; //是否有二级分类
        $(".half").html("").css("height", "0").css("opacity", "0");
        var html = "";
        $.each(m_list.fenlei_data, function(o, p) {
            if (p.parent_url_name == url_name) {
                has_lel2 = false;
                //有二级分类
                html += "<div class='ahalf' url_name='" + p.url_name + "' parent_url_name='" + p.parent_url_name + "' category_name='" + p.category_name + "'><span>" + p.category_name + "</span></div>";
            }
        });

        //没有二级分类
        if (has_lel2) {
            $(".half").hide().css("opacity", "0");
            window.location.href = "/m/list/" + url_name + "?url_name=" + url_name + "&category_name=" + category_name;
            return;
        }

        $("." + url_name).html("<div class='ahalf' url_name='" + url_name + "' category_name='" + category_name + "'><span>全部" + category_name + "</span></div>" + html);
        if ($(".ahalf").length > 0) {
            var hang = Math.ceil($(".ahalf").length / 2);
            $("." + url_name).css("height", hang * 41 + "px").show().css("opacity", "1");
            //页面高度控制
            // console.log(hang * 41);
            var win_height = window.innerHeight;
            var ct_height = parseInt($(".list_cty").css("height"));
            if (ct_height > win_height) {
                $(".zhe_list_w").css("min-height", ct_height + 44 + "px");
            }
            //二级分类筛选按钮绑定方法
            $.zheui.bindTouchGoto($(".ahalf"), get_level3);
        }
    }

    function get_level3(o) {
        var category_name = o.attr("category_name");
        var url_name = o.attr("url_name");
        var parent_url_name = o.attr("parent_url_name");
        if (parent_url_name == null) {
            window.location.href = "/m/list/" + url_name + "?url_name=" + url_name + "&category_name=" + category_name;
        } else {
            window.location.href = "/m/list/" + parent_url_name + "/" + url_name + "?url_name=" + url_name + "&category_name=" + category_name + "&parent_url_name=" + parent_url_name;
        }

    }

    //返回首页按钮
    $.zheui.bindTouchGoto($(".btn_tohome"), function(o) {
        window.location.href = $.zheui.domain;
    });

    //all 天猫 淘宝 选项
    $.zheui.bindTouchGoto($(".shop_type"), function(o) {
        if (!o.hasClass('btn_select')) {
            o.addClass('btn_select').siblings('.shop_type').removeClass('btn_select');
            m_list.data_init.shop_type = o.attr("data_type");
        } else {
            m_list.data_init.shop_type = o.attr("data_type");
        }
    });

    //价格区间
    $(".row input").bind({
        focus: function() {
            $(this).val("");
        },
        blur: function() {
            if ($(this).val().length == 0) {
                $(this).css("color", "#353840");
                $(this).val($(this).attr("data_t"));
            }
        }
    });
    //筛选确定按钮
    $("#select_btn").on('click', function() {
        $(".row input").blur();
        m_list.data_init.min_price = '';
        m_list.data_init.max_price = '';
        if($("#f_price").val() != ''){
            var f_price = parseInt($("#f_price").val()) * 100;
        }else{
            var f_price = $("#f_price").val();
        }
        if($("#h_price").val() != ''){
            var h_price = parseInt($("#h_price").val()) * 100;
        }else{
            var h_price = $("#h_price").val();
        }
        
        if (f_price > 0 && h_price > 0) {
            if (f_price > h_price) {
                $.zheui.toast("请输入正确的价格");
                return;
            }
        }
        if (f_price > 0) {
            m_list.data_init.min_price = f_price;
        }
        if (h_price > 0) {
            m_list.data_init.max_price = h_price;
        }
        //var push_data = {};
        //if (history.state) {
        //    push_data = {
        //        shop_type_id: $('.btn_select').attr('id'),
        //        f_price: $("#f_price").val(),
        //        h_price: $("#h_price").val(),
        //        dis_id: m_list.data_init.url_name,
        //        category_name: $(".span_color").html()
        //    }
        //} else {
        //    push_data = {
        //        shop_type_id: $('.btn_select').attr('id'),
        //        f_price: $("#f_price").val(),
        //        h_price: $("#h_price").val()
        //    }
        //}
    	//history.replaceState(push_data, '', [location.href]);



    	// #108492 记录列表页排序选项。
        set_select_history(m_list.data_init.url_name, $(".span_color").html());

        $("#zhe_list_main").html(""); //去掉当前列表数据
        $(".loading_more").hide();
        $("#loading").show();
        $("#zhe_list_bg1").hide();
        $(".list_new_category").hide();
        if (!m_list.data_init.shop_type == "" || !m_list.data_init.min_price == "" || !m_list.data_init.min_price == "") {
            flag = true;
            $('o').css("background-position", "-11px -10px");
        } else {
            $(".btn_filter").removeClass('nav_on');
            $(".btn_filter").children('o').css("background-position", "-21px -10px");
        }
        $('#list_select_left').css('height', 'auto');
        m_list.init(1);
        //点击筛选浮层确定按钮打点统计
        switch(push_data.shop_type_id){
            case "all":
                if(f_price == '' || h_price == ''){
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+""+h_price+",eventtype:all}");
                }else{
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+"."+h_price+",eventtype:all}");
                }
                break;
            case "tianmao":
                if(f_price == '' || h_price == ''){
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+""+h_price+",eventtype:1}");
                }else{
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+"."+h_price+",eventtype:1}");
                }            
                break;
            case "taobao":
                if(f_price == '' || h_price == ''){
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+""+h_price+",eventtype:0}");
                }else{
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+"."+h_price+",eventtype:0}");
                }  
                break;
            case "shop":
                if(f_price == '' || h_price == ''){
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+""+h_price+",eventtype:4}");
                }else{
                    $.tracklog.action("select",track_data,"{eventvalue:"+f_price+"."+h_price+",eventtype:4}");
                }  
                break;
            default:
        }
    });

    //绑定列表点击事件
    $(document).on("click", "#zhe_list_main li", function() {
        var url_id = $(this).attr("data-url");
        var dealId = $(this).attr("data-id");
        if (url_id.length > 0) {
            window.location.href = url_id;
        }
    });
    //隐藏筛选弹框
    function hide_list_wbg() {
        $(".btn_filter").removeClass("btn_filter_on");
        //$("#list_select_left").css("-webkit-transform", "translate3d(0,0,0)");
        $("#zhe_list_wbg").hide();
        $("#list_select_right").hide();
    }

    //隐藏分类弹框
    $.zheui.bindTouchGoto($("#zhe_list_bg"), function() {
        $("#zhe_list_bg").hide();
        $(".zhe_list_w").css("min-height", "auto");
    });


});