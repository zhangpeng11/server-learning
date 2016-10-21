/*
 * 我的优惠券
 * */
define(function(require, exports, module) {

    require("zepto");
    require("../common/base");

    //tab
    $.zheui.bindTouchGoto($(".coupon_nav span"), function(obj, index) {
        var _this = obj;
        var _index = index;
        _this.addClass("coupon_navon").siblings().removeClass("coupon_navon");
        $(".coupon_con").eq(_index).show().siblings(".coupon_con").hide();
    });
    //存取cookie，判断是否是第一次登陆，控制提示蒙层的显示
    var isMengCengFirstShow = $.cookie.get("isMengCengFirstShow") || "true";
    //初始化页面
    function init() {
        var newCoupon = $("#newCoupon");
        var finishCoupon = $("#finishCoupon");
        var overdueCoupon = $("#overdueCoupon");
        //未使用
        $.ajax({
            type: "GET",
            url: "/api/coupons/usercoupons?page=1&per_page=10&status=0&over_flag=0",
            success: function(data) {
                var _data = data;
                if (typeof _data == "object") {
                    if (_data.Result_.Code == 0 && _data.CouponInfoListPaginate.Total != 0) {
                        newCoupon.find(".loading").hide();
                        createDom(_data, newCoupon);
                        //如果是第一次进入，则显示蒙版。
                        if (isMengCengFirstShow == "true") {
                            $('.shadow').show();
                            $(".shadow").css("opacity", "1");
                            $('.coupon_count').eq(0).addClass("shadowCon");
                            setTimeout(function() {
                                $('.shadow').hide();
                                $(".shadow").css("opacity", "0");
                                $('.coupon_count').eq(0).removeClass("shadowCon");
                            }, 3000);
                            var mTop = ($('.coupon_nav').eq(0).height() + $('.coupon_count').eq(0).height());
                            $('.sdTip').css("margin-top", mTop + "px");
                            $.cookie.set("isMengCengFirstShow", false);
                            $.zheui.bindTouchGoto($(".shadow"), function() {
                                $('.shadow').hide();
                                $(".shadow").css("opacity", "0");
                                $('.coupon_count').eq(0).removeClass("shadowCon");
                            });
                        }
                    } else {
                        newCoupon.find(".loading").text("暂无优惠券").addClass("nofound");
                    }
                } else {
                    newCoupon.find(".loading").text("数据加载失败");
                }
            },
            timeout: 20000,
            error: function() {
                // alert("D111F");
                newCoupon.find(".loading").text("网络异常,请稍后再试");
                console.log("网络异常");
            }
        });

        //已使用
        $.ajax({
            type: "GET",
            url: "/api/coupons/usercoupons?page=1&per_page=10&status=1&over_flag=-1",
            success: function(data) {
                //console.log(data);
                var _data = data;
                if (typeof _data == "object") {
                    if (_data.Result_.Code == 0 && _data.CouponInfoListPaginate.Total != 0) {
                        finishCoupon.find(".loading").hide();
                        createDom(_data, finishCoupon);
                    } else {
                        finishCoupon.find(".loading").text("暂无优惠券").addClass("nofound");
                    }
                } else {
                    finishCoupon.find(".loading").text("数据加载失败");
                }
            },
            timeout: 20000,
            error: function() {
                finishCoupon.find(".loading").text("网络异常,请稍后再试");
                console.log("网络异常");
            }
        });

        //已过期
        $.ajax({
            type: "GET",
            url: "/api/coupons/usercoupons?page=1&per_page=10&status=0&over_flag=1",
            success: function(data) {
                //console.log(data);
                var _data = data;
                if (typeof _data == "object") {
                    if (_data.Result_.Code == 0 && _data.CouponInfoListPaginate.Total != 0) {
                        overdueCoupon.find(".loading").hide();
                        createDom(_data, overdueCoupon);
                    } else {
                        overdueCoupon.find(".loading").text("暂无优惠券").addClass("nofound");
                    }
                } else {
                    overdueCoupon.find(".loading").text("数据加载失败");
                }
            },
            timeout: 20000,
            error: function() {
                overdueCoupon.find(".loading").text("网络异常,请稍后再试");
                console.log("网络异常");
            }
        });

    }
    init();

    //创建dom节点
    function createDom(data, obj) {
        var datalist = data.CouponInfoListPaginate.CouponInfoList;
        var htmlstr = '';
        for (var i = 0; i < datalist.length; i++) {
            var StartTime = datalist[i].StartTime.substring(0, datalist[i].StartTime.indexOf(" "));
            var EndTime = datalist[i].EndTime.substring(0, datalist[i].EndTime.indexOf(" "));
            var ActiveId = datalist[i].ActivityId;
            var extraInfo = datalist[i].CouponExtraInfo.ProductFlag; //int 商品限制标识位，0-不限制，1-限制
            var fkey = datalist[i].ActivityFKey; //优惠券活动id的加密串
            htmlstr += '<div class="coupon_count" data-id="' + ActiveId + '" data-flag="' + extraInfo + '"data-fkey="' + fkey + '"><span class="price">' + datalist[i].Price + '元</span>';
            if (datalist[i].CouponExtraInfo && datalist[i].CouponExtraInfo.SourceTypeDesc) {
                htmlstr += '<span class="platform_type">' + datalist[i].CouponExtraInfo.SourceTypeDesc + '</span>';
            }
            htmlstr += '<span class="lower_price">' + datalist[i].Dec + '</span><span class="time">有效期：' + StartTime + ' 至 ' + EndTime + '</span></div>';
        }

        obj.find(".coupon_con_inner").append(htmlstr);

        if (obj.attr('id') == 'newCoupon') {
            //优惠券绑定跳转事件 跳转到商城或者活动凑单页面
            $.zheui.bindTouchGoto($('.coupon_count'), function(obj) {
                var _this = obj;
                if (_this.attr("data-flag") == 0) {
                    var url = "http://h5.m.zhe800.com/m/list/all";
                    // window.location.href = encodeURIComponent(url);
                    window.location.href = url;
                } else {
                    var aID = _this.attr("data-fkey")
                    var url = $.zheui.domain + '/h5public/coupon?activityId=' + aID + '&source_Type=3&isFromCopponList=true';
                    window.location.href = url;
                }
            });

        }

        if (data.CouponInfoListPaginate.Total > 10) {
            obj.find(".coupon_paging").show().text("加载更多");
        }
    }

    //初始化页码为2
    var pagenum1 = 2,
        pagenum2 = 2,
        pagenum3 = 2;

    //加载下一页
    function loadNextPage(currpagenum, status, over_flag, obj) {
        obj.find(".coupon_paging").text("加载中...");
        $.ajax({
            type: "GET",
            url: "/api/coupons/usercoupons?page=" + currpagenum + "&per_page=10&status=" + status + "&over_flag=" + over_flag,
            success: function(data) {
                var _data = data;
                if (typeof _data == "object") {
                    if (_data.Result_.Code == 0) {
                        if (_data.CouponInfoListPaginate.CouponInfoList.length) {
                            createDom(_data, obj);
                        }
                        var _datalist = _data.CouponInfoListPaginate;
                        if (_datalist.Page * _datalist.PerPage >= _datalist.Total) {
                            obj.find(".coupon_paging").text("没有更多了");
                        }

                    } else {
                        obj.find(".coupon_paging").text("数据加载失败");
                    }
                    if (obj.attr("id") == "newCoupon") {
                        pagenum1++;
                    } else if (obj.attr("id") == "finishCoupon") {
                        pagenum2++;
                    } else if (obj.attr("id") == "overdueCoupon") {
                        pagenum3++;
                    }

                } else {
                    obj.find(".coupon_paging").text("数据加载失败");
                }
            },
            timeout: 20000,
            error: function() {
                obj.find(".coupon_paging").text("网络异常,请稍后再试");
                console.log("网络异常");
            }
        });

    }

    //绑定加载下一页事件
    $(window).bind("scroll", function() {
        var wh = window.innerHeight;
        var sctop = document.body.scrollTop;
        var pageh = $("#ct").height();
        if ((wh + sctop) >= pageh) {
            $(".coupon_con").each(function() {
                if ($(this).css("display") == "block" && $(this).find(".coupon_paging").css("display") == "block") {
                    if ($(this).attr("id") == "newCoupon") {
                        loadNextPage(pagenum1, 0, 0, $(this));
                    } else if ($(this).attr("id") == "finishCoupon") {
                        loadNextPage(pagenum2, 1, -1, $(this));
                    } else if ($(this).attr("id") == "overdueCoupon") {
                        loadNextPage(pagenum3, 0, 1, $(this));
                    }
                }
            });
        }
    });

});