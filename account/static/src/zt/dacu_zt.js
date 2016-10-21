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

                var listItems = data.objects,
                    html = "";
                    tpl = '<li data-id="#PRODUCT_ID#" data-url="#PRODUCT_URL#">' +
                        '<div class="img">' +
                        '<img alt="#PRODUCT_TITLE#" src="//i0.tuanimg.com/ms/zhe800m/dist/img/img_151_170.jpg" width="151" height="170" data-url="#PRODUCT_IMG#">' +
                        '<span class="icon #PRODUCT_TYPE#"></span>' + 
                        '</div>' +
                        '<div class="attr">' +
                        '<span class="price">￥#PRODUCT_PRICE#</span>' +
                        '<del>￥#PRODUCT_LIST_PRICE#</del>' +
                        '<span class="discount">#PRODUCT_DISCOUNT#折</span>' +
                        '<h3 class="title">#PRODUCT_TITLE#</h3>' +
                        '</div>' +
                        '</li>',
                    $list = $("#zt_list"),
                    $listItems = null,
                    $loading = $("#loading_init"),
                    $loadingMore = $(".loading_more"),
                    $listEnd = $(".list_end");

                if (!listItems || listItems.length === 0) {
                    $loading.hide();
                    $("#ct").append('<div class="not_data"><i></i>暂无符合条件的数据</div>');
                    return;
                }

                listItems.forEach(function (item, index) {

                    html += tpl.replace("#PRODUCT_ID#", item.id)
                        .replace("#PRODUCT_URL#", item.source_type == 0 ? item.wap_url : $.zheui.domain + "/m/detail/detail?id=" + item.id)
                        .replace("#PRODUCT_TYPE#", item.source_type == 1 ? "temai" : "tmall")
                        .replace("#PRODUCT_IMG#", item.image_url.normal)
                        .replace(/#PRODUCT_TITLE#/g, item.short_title)
                        .replace("#PRODUCT_PRICE#", item.price / 100)
                        .replace("#PRODUCT_LIST_PRICE#", item.list_price / 100)
                        .replace("#PRODUCT_DISCOUNT#", (item.price / item.list_price *10 ).toFixed(1));
                });

                $loading.hide();
                $list.append('<ul class="list">' + html + "</ul>");

                //跳转品牌团商品列表页
                $listItems = $list.find("li");
                $.zheui.bindTouchGoto($listItems, function (element) {
                    var url = element.data("url");

                    if (url.length > 0) {
                        window.location.href = $.tracklog.outUrl(url);
                    }
                });

                $list.find("ul").imglazyload({"imgattr": "data-url"});
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

    $(".zt_w .banner").hide()
    if (zt.source === "banner") {
        if ($(".zt_w .banner img").attr("src") != "" &&
                $(".zt_w .banner img").attr("src") != location.href) {
            $(".zt_w .banner").show()
        }
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