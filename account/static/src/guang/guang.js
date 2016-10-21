/*
 * 值得逛
 */
define(function(require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    
    $.cookie.set("pos_value","guang");
    $.cookie.set("pos_type","guang");
    var track = require("../common/track_v2");
    track.init("m");
    var track_data = {
      pos_value:"guang",
      pos_type:"guang"
    };
    var iScroll = require("../common/iscroll");

    //置顶功能
    var gotop = require("../common/gotop");
    gotop.init();

    //显示下载浮层
    //var showFloat = require('../common/showFloat');
    //showFloat.showFloat();
    //showFloat.closeOtherFloat();
    var showFloat = require('../common/show_float');
    showFloat.showDownloadGuide();

    //值得逛全局变量
    var guang = {};
    guang.nextpage = false; //默认是否有下一页
    guang.tag = "-1"; //初始化显示的菜单项：精选
    guang.isload = false; //是否在加载中
    guang.page = 1; //初始化页码
    guang.perPage = 20; //每页数量
    guang.data = {}; //值得逛全局数据

    //用户信息
    var user = {};
    user.userRole = $.cookie.get("user_role");
    user.userType = $.cookie.get("user_type");

    //统计标记
    url_name = guang.tag;

    //点击功能封装 去除冒泡阻塞
    function bindTouchEvent($els, callback) {
        var isMove;
        $els.each(function(index, ele) {
            $(ele).bind({
                "touchstart": function(e) {
                    isMove = false;
                },
                "touchmove": function(e) {
                    isMove = true;
                },
                "touchend": function(e) {
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

    function loadGuangHot() {
        guang.isload = false;
        guang.data.left = 0;
        guang.data.top = 0;

        var url = "/m/banner/guang?user_role=" + user.userRole + "&user_type=" + user.userType + "&url_name=" + guang.tag;

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(data) {
                guang.isload = true;

                var guangHot = data && data.length ? data[0] : null,
                    html, url = "";
                tpl = '<div data-id="#GUANG_ID#" class="guang_list_item guang_itemad">' +
                    '<a href="#GUANG_URL#">' +
                    '<img src="//i0.tuanimg.com/ms/zhe800m/dist/img/img_151_170.jpg" data-url="#GUANG_IMG#">' +
                    '<div class="item_tt">#GUANG_TITLE#</div>' +
                    '</a>' +
                    '</div>',
                $guangList = $("#guang_list");

                if (guangHot) {
                    if (guangHot.ad_type === 0) {
                        url = "/m/guang/zt?f=guang&s=guang&deals=" + guangHot.ad_data;
                    } else if (guangHot.ad_type === 1) {
                        url = guangHot.ad_data;
                    } else if (guangHot.ad_type === 2) {
                        url = $.tracklog.outUrl("http://out.tao800.com/m/deal/" + guangHot.ad_data);
                    } else if (guangHot.ad_type === 3) {
                        url = "/m/detail/detail?id=" + guangHot.ad_data;
                    }

                    if (url !== "") {
                        html = tpl.replace("#GUANG_ID#", guangHot.id)
                            .replace("#GUANG_URL#", url)
                            .replace("#GUANG_IMG#", guangHot.pic)
                            .replace("#GUANG_TITLE#", guangHot.title);

                        $guangList.find(".guang_list_box").eq(0).append(html);
                    }
                }

                loadGuangList(guang.tag, guang.page);
            },
            timeout: 20000,
            error: function() {
                $(".loading").html("网络异常，请稍候再试");
            }
        });
    }
    //推荐理由超过50字用省略号表示
    function str_sub(str){
        if(str.length>50){
            return str.substr(0,49)+'...';
        }
        return str;
    }
    //加载值得逛列表
    //@tag：加载的菜单项
    //@page：值得逛列表的页码，以1开始
    //价格以分为单位
    function loadGuangList(tag, page) {
        guang.page = page;
        guang.isload = false;

        var url = "/v2/guang/deals?image_type=all&image_model=jpg&per_page=" + guang.perPage + "&page=" + page + "&tag_url=" + tag;

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(data) {
                guang.isload = true;
                console.log("load guang data",data);
                if (data != null) {
                    guang.nextpage = data.meta.has_next;
                    var guangListItems = data.objects,
                        leftHtml = "<div>",
                        rightHtml = "<div>";
                    tpl = '<div data-id="#GUANG_ID#" class="guang_list_item guang_itemls" data-url="#GUANG_URL#">' +
                        '<img src="//i0.tuanimg.com/ms/zhe800m/dist/img/img_151_170.jpg" data-url="#GUANG_IMG#">' +
                        '<div class="price_line">' +
                        '<span class="pprice">￥#GUANG_PRICE#</span><del>￥#GUANG_OLD#</del>' +
                        '<span class="p_zhe">#GUANG_DISCOUNT#折</span></div>' +
                        '<div class="item_tt">#GUANG_TITLE#</div>' +
                        '</div>',
                    $guangList = $("#guang_list"),
                    $guangListItems = null,
                    $loading = $("#loading_init"),
                    $loadingMore = $(".loading_more"),
                    $listEnd = $(".list_end");

                    guangListItems.forEach(function(guangItem, index) {
                        if (index % 2 === 0) {
                            leftHtml += tpl.replace("#GUANG_ID#", guangItem.id)
                                .replace("#GUANG_IMG#", guangItem.image_url.big)
                                .replace("#GUANG_URL#", (guangItem.source_type == 1) ? ($.zheui.domain + "/m/detail/detail?id=" + guangItem.id) : guangItem.wap_url)
                                .replace("#GUANG_TITLE#", str_sub(guangItem.recommend_reason))
                                .replace("#GUANG_PRICE#", guangItem.price / 100)
                                .replace("#GUANG_OLD#", guangItem.list_price / 100)
                                .replace("#GUANG_DISCOUNT#", (guangItem.price / guangItem.list_price * 10).toFixed(1));
                        } else {
                            rightHtml += tpl.replace("#GUANG_ID#", guangItem.id)
                                .replace("#GUANG_IMG#", guangItem.image_url.big)
                                .replace("#GUANG_URL#", guangItem.wap_url)
                                .replace("#GUANG_TITLE#", str_sub(guangItem.recommend_reason))
                                .replace("#GUANG_PRICE#", guangItem.price / 100)
                                .replace("#GUANG_OLD#", guangItem.list_price / 100)
                                .replace("#GUANG_DISCOUNT#", (guangItem.price / guangItem.list_price * 10).toFixed(1));
                        }
                    });

                    $loading.hide();
                    $guangList.find(".guang_list_box").eq(0).append(leftHtml + "</div>");
                    $guangList.find(".guang_list_box").eq(1).append(rightHtml + "</div>");

                    //跳转品牌团商品列表页
                    $guangListItems = $guangList.find(".guang_itemls");
                    $.zheui.bindTouchGoto($guangListItems, function(element) {
                        var url = element.data("url");

                        if (url.length > 0) {
                            window.location.href = $.tracklog.outUrl(url);
                        }
                    });

                    //$guangList.imglazyload({
                    //    "imgattr": "data-url"
                	//});

                    lazyLoad();

                    if (guang.nextpage) {
                        $loadingMore.show();
                    } else {
                        $loadingMore.hide();
                        $listEnd.show();
                    }

                }else{
                    //$guangList.append("暂时没有数据");
                }


            },
            timeout: 20000,
            error: function() {
                $(".loading").html("网络异常，请稍候再试");
            }
        });
    }

    function lazyLoad() {
    	var images = document.querySelectorAll('#guang_list img[data-url]'), h = document.documentElement.clientHeight;
    	[].forEach.call(images, function (image) {
    		var bounds = image.getBoundingClientRect();
    		if (bounds.bottom > 0 && bounds.top < h) {
    			image.src = image.getAttribute('data-url') || '';
    			image.removeAttribute('data-url');
    		}
    	});
    	if (!lazyLoad.bind && document.querySelector('#guang_list img[data-url]')) {
    		lazyLoad.bind = 1;
    		window.addEventListener('scroll', lazyLoad.onScroll);
    	}
    }
    lazyLoad.onScroll = function () {
    	if (lazyLoad.timer) clearTimeout(lazyLoad.timer);
    	lazyLoad.timer = setTimeout(lazyLoad, 200);
    };
    lazyLoad.bind = 0;
    document.querySelector('#guang_list img[data-url]') && (lazyLoad.bind = 1, window.addEventListener('scroll', lazyLoad.onScroll), lazyLoad());

    //加载值得逛导航
    function loadGuangNav() {
        $.ajax({
            type: "GET",
            url: "/v2/guang/tags?user_role=" + user.userRole + "&user_type=" + user.userType,
            dataType: "json",
            success: function(navData) {
                var tpl = '<li class="#CLASS#" data-id="#ID#" data-url="#URL#">#NAME#</li>',
                    html = '',
                    scrollWidth = 0,
                    scroll = null;
                //console.log(navData);
                navData.forEach(function(navItem, index) {
                    //if (navItem.parent_url_name === "") {
                        html += tpl.replace("#ID#", navItem.tag_id)
                            .replace("#URL#", navItem.url_name)
                            .replace("#NAME#", navItem.category_name)
                            .replace("#CLASS#", navItem.tag_id == 0 ? "nav_on" : "");
                    //}
                });


                $("#guang_nav_list").html(html);

                //跳转品牌团分类列表
                bindTouchEvent($("#guang_nav_list li"), function(element,index) {
                    var $this = element,
                        $guangList = $("#guang_list"),
                        $guangNavItems = $("#guang_nav_list li"),
                        $loading = $("#loading_init"),
                        $loadingMore = $(".loading_more"),
                        $listEnd = $(".list_end");
                    var id = $this.attr("data-id");
                    if ($this.hasClass("nav_on")) {
                        return;
                    } else {
                        $guangNavItems.removeClass("nav_on");
                        $this.addClass("nav_on");

                        $guangList.find(".guang_list_box").html("");
                        $loadingMore.hide();
                        $listEnd.hide();
                        $loading.show();

                        guang.tag = $this.data("url");
                        loadGuangList(guang.tag, 1);

                        $.tracklog.action("tab",track_data,"{eventvalue:"+id+",eventindex:"+(index+1)+"}");
                        //统计标记
                        url_name = guang.tag;
                    }
                });

                //导航左右滑动
                $("#guang_nav_list li").forEach(function(item) {
                    var $item = $(item);

                    scrollWidth += $item.width();
                });
                scrollWidth += 10;
                $("#guang_nav_scroller").width(scrollWidth);
                scroll = new iScroll('guang_nav_wrapper', {
                    snap: true,
                    momentum: false,
                    hScrollbar: false,
                    onScrollEnd: function() {}
                });
            },
            timeout: 20000,
            error: function() {
                $(".loading").html("网络异常，请稍候再试");
            }
        });
    }

    loadGuangHot();
    loadGuangNav();

    //绑定加载下一页事件
    $(window).bind("scroll", function() {
        var wh = window.innerHeight;
        var sctop = document.body.scrollTop;
        var pageh = $("#ct").height();
        if ((wh + sctop + 20) >= pageh) {
            if (guang.nextpage && guang.isload) {
                if ($(".loading_more").length == 0) {
                    var html = '<div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div>';
                    $(".brand_main").append(html);
                } else {
                    $(".loading_more").html('<span class="loading"><i class="icon_load"></i>加载中......</span>').show();
                }
                var nextPage = guang.page + 1;
                loadGuangList(guang.tag, nextPage);
            }
        }
    });
});