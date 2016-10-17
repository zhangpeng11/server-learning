/*
* 值得逛
*/
define(function (require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");
    require("../common/track");

    //置顶功能
    var gotop = require("../common/gotop");
    gotop.init();

    //值得逛全局变量
    var zt = {};
    zt.nextpage = false;   //默认是否有下一页
    zt.isload = false;     //是否在加载中
    zt.page = 1;           //初始化页码
    zt.perPage = 20;       //每页数量
    zt.from = $.zheui.getUrlKeyVal("f");
    zt.source = $.zheui.getUrlKeyVal("s");
    zt.deals = $.zheui.getUrlKeyVal("deals");
    zt.id = $.zheui.getUrlKeyVal("id");

    //用户信息
    var user = {};
    user.userRole = $.cookie.get("user_role");
    user.userType = $.cookie.get("user_type");

    //加载商品列表
    //@page：列表的页码，以1开始
    //价格以分为单位
    function loadZTList(page) {
        zt.page = page;
        zt.isload = false;

        var url;

        if (zt.deals !== "") {
            //zt.deals = "1005474,1001590,939010";
            url = "/m/api/getdealsbylist?deals=" + zt.deals + "&page=" + page + "&size=" + zt.perPage;
        }
        else if (zt.id !== "") {
            //zt.id = "16";
            url = "/m/api/getdealsbybannerid?bannerId=" + zt.id + "&page=" + page + "&size=" + zt.perPage;
        }
        else {
            return;
        }

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function (data) {
                zt.isload = true;
                zt.nextpage = data.has_next;

                var guangListItems = data.objects,
                    leftHtml = "<div>", rightHtml = "<div>";
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

                if (!guangListItems || guangListItems.length === 0) {
                    $loading.hide();
                    $("#ct").append('<div class="not_data"><i></i>暂无符合条件的数据</div>');
                    return;
                }

                guangListItems.forEach(function (guangItem, index) {
                    if (index % 2 === 0) {
                        leftHtml += tpl.replace("#GUANG_ID#", guangItem.id)
                            .replace("#GUANG_IMG#", guangItem.image_url.big)
                            .replace("#GUANG_URL#", (guangItem.source_type == 1) ? ($.zheui.domain + "/m/detail/detail?id=" + guangItem.id) : guangItem.wap_url)
                            .replace("#GUANG_TITLE#", guangItem.title)
                            .replace("#GUANG_PRICE#", guangItem.price / 100)
                            .replace("#GUANG_OLD#", guangItem.list_price / 100)
                            .replace("#GUANG_DISCOUNT#", (guangItem.price / guangItem.list_price *10 ).toFixed(1));
                    }
                    else {
                        rightHtml += tpl.replace("#GUANG_ID#", guangItem.id)
                            .replace("#GUANG_IMG#", guangItem.image_url.big)
                            .replace("#GUANG_URL#", guangItem.wap_url)
                            .replace("#GUANG_TITLE#", guangItem.title)
                            .replace("#GUANG_PRICE#", guangItem.price / 100)
                            .replace("#GUANG_OLD#", guangItem.list_price / 100)
                            .replace("#GUANG_DISCOUNT#", (guangItem.price / guangItem.list_price *10 ).toFixed(1));
                    }
                });

                $loading.hide();
                $guangList.find(".guang_list_box").eq(0).append(leftHtml + "</div>");
                $guangList.find(".guang_list_box").eq(1).append(rightHtml + "</div>");

                //跳转品牌团商品列表页
                $guangListItems = $guangList.find(".guang_itemls");
                $.zheui.bindTouchGoto($guangListItems, function (element) {
                    var url = element.data("url");

                    if (url.length > 0) {
                        window.location.href = $.tracklog.outUrl(url);
                    }
                });

                $guangList.imglazyload({"imgattr": "data-url"});
                if (zt.nextpage) {
                    $loadingMore.show();
                }
                else {
                    $loadingMore.hide();
                    $listEnd.show();
                }
            },
            timeout: 20000,
            error: function () {
                $(".loading").html("网络异常，请稍候再试");
            }
        });
    }

    loadZTList(zt.page);

    //绑定加载下一页事件
    $(window).bind("scroll", function () {
        var wh = window.innerHeight;
        var sctop=document.body.scrollTop;
        var pageh = $("#ct").height();
        if((wh + sctop + 20) >= pageh) {
            if(zt.nextpage && zt.isload) {
                if($(".loading_more").length == 0) {
                    var html = '<div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div>';
                    $(".brand_main").append(html);
                }else{
                    $(".loading_more").html('<span class="loading"><i class="icon_load"></i>加载中......</span>').show();
                }
                var nextPage = zt.page + 1;
                loadZTList(nextPage);
            }
        }
    });
});
