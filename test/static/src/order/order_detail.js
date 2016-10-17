/**
 * 订单管理专用js
 */
define(function(require, exports, module) {
    var $ = require("zepto");
    require('../common/base');
    var pay_countDown = require('../common/countdown');
    var dialog = require('../common/dialog');
    var mydialog = new dialog();
    var pay = require("../common/unpay");
    var cartPay = require("../cart/cartpay");
    var choosebox = require("../common/choose_box");
    var mod_protocol = require("../order/mod_protocol");
    var myLayer = require("../order/showFloat_v2");
    var box_scrollTop = '';

    //im切换模块
    var im_fun = require("../im/im");
    //im初始化，判断开关是否打开
    var im_data;
    var order_url = window.location.href;
    if(order_url.indexOf("get_order_list")>-1){
        im_data = {};
    }else{
        im_data = IM_data;
    }
    im_fun.sellerSwitch(im_data.sellerid,"#seller_qq1 .icon_qq,#seller_qq3 .icon_qq");
    
    //如果从易信到m站，去掉启动QQ卖家
    //如果从易信到m站，易信需要更改title
    if ($.zheui.getUrlKeyVal('platformType') !== 'yixin') {
        $('.seller_qq').css('visibility', 'visible');
    }else{
        document.title = '我的订单';
    }

    //启动倒计时
    var _countdown = $(".countdown");
    if (_countdown.length) {
        _countdown.each(function() {
            var endtime = $(this).attr("endtime");
            pay_countDown.countDown(endtime, '', 3, $(this));
        });
    }

    //取消订单
    function cancelOrder(ordernum,msg) {
        if (typeof _cause == "object") {
            var htmlstr = '<ul class="select_yy">';
            for (var i = 0; i < _cause.length; i++) {
                htmlstr += '<li id="' + _cause[i].id + '">' + _cause[i].text + '<i class="ico"></i></li>';
            }
            if(msg){
                htmlstr += msg;
            }else{
                htmlstr += '<div class="order-dialog-txt">取消订单后，所使用优惠券将返还至您的账户。</div>';
            }
            htmlstr += '</ul>';
            mydialog.create(2, htmlstr, "确定", "取消");
        } else {
            $.zheui.toast("数据读取错误");
            return;
        }
        $.zheui.bindTouchGoto($(".select_yy li"), function(obj) {
            var _this = obj;
            _this.addClass("on").siblings().removeClass("on");
        });

        $.zheui.bindTouchGoto($(".dialog_box").find(".btn_confirm"), function(obj) {
            var _this = obj;
            var _id = "";
            $(".select_yy li").each(function() {
                if ($(this).hasClass("on")) {
                    _id = $(this).attr("id");
                }
            });
            if (_id == '') {
                $.zheui.toast("请选择取消原因");
                return;
            }
            mydialog.hide();
            $.zheui.loadingbar("show", "请求中,请稍后...");
            $.ajax({
                type: "POST",
                url: "/orders/h5_m/cancel?order_id=" + ordernum + "&reason=" + _id,
                success: function(data) {
                    console.log(data);
                    var _data = data;
                    if (typeof _data == "object") {
                        $.zheui.loadingbar("hide", "请求中,请稍后...");
                        $.zheui.toast(_data.msg);
                        if (_data.ret == 0) {
                            window.location.href = location.href;
                        }
                    }
                },
                timeout: 20000,
                error: function() {
                    console.log("网络异常");
                    $.zheui.toast("网络异常");
                    $.zheui.loadingbar("hide", "请求中,请稍后...");
                }
            });
        });
        $.zheui.bindTouchGoto($(".dialog_box").find(".btn_cancel"), function(obj) {
            var _this = obj;
            mydialog.hide();
        });
    }
    $.zheui.bindTouchGoto($("#btnCancel"), function(obj) {
        var _this = obj;
        var ordernum = _this.attr("ordernum");
        var cheapType=_this.attr("cheapAmountType");  //订单类型  默认0：无；1：1元抢；2：限时抢；101：平台满减
        if(cheapType == 101){
            getReduceInfo(_this,1);
        }else{
            cancelOrder(ordernum);
        }
    });
    /**
     * 获取满减商品信息
     * arr     绑定节点
     * type    1：取消订单 ； 2：付款
     */
    function getReduceInfo(arr, type) {
        var _arr = arr;
        var ordernum = _arr.attr("ordernum");
        var orderbatch = _arr.attr("orderbatch");
        var cheapAmountType = _arr.attr("cheapAmountType");
        var orderItemRule = _arr.attr("activesatisfyrule");
        var orderCost = 0;
        var orderCount, orderItemRule;

        //满减规则解析
        var ruleArray = orderItemRule.split("-");
        var orderItemRules = "满" + ruleArray[0] + "减" + ruleArray[1];
        $.zheui.loadingbar("show", "请求中,请稍后...");
        $.ajax({
            type: "POST",
            url: "/orders/h5/queryActiveOrderList?order_batch=" + orderbatch + "&order_id=" + ordernum,
            success: function(data) {
                $.zheui.loadingbar("hide", "请求中,请稍后...");
                console.log(data);
                var _data = data;
                if (typeof _data == "object") {
                    if (_data.ret == 0 && _data.data.length) {
                        var ordernums = [];
                        //获取商品数量与合计金额
                        orderCount = _data.data.length;
                        $.each(_data.data, function(index, val) {
                            ordernums[index] = val.orderid;
                            orderCost += Number(val.amount);
                        });
                        ordernum = ordernums.join(",");

                        if (type == 1) {
                            var orderDialogMsg = '<div class="order-dialog-txt red">确认后，将自动取消本次' + orderItemRules + '的' + orderCount + '个订单。</div>';
                            cancelOrder(ordernum,orderDialogMsg);
                        } else if (type == 2) {
                            var reduceMsg = '将自动支付本次' + orderItemRules + '的' + orderCount + '个订单，共计￥' + orderCost.toFixed(2);
                            if ($(".select_pay .ord_paym").length) {
                                var $titMsg = $(".tit-msg");
                                if(!$titMsg.length || $titMsg.val() != reduceMsg){
                                    $(".order-dialog-head").html('<h2>请选择支付方式</h2><span class="tit-msg">' + reduceMsg + '</span>');
                                }
                                mydialog.show();
                            } else {
                                getPayType(cheapAmountType,ordernum,reduceMsg);
                            }
                        }
                    }
                }
            },
            timeout: 20000,
            error: function() {
                console.log("网络异常");
                $.zheui.loadingbar("hide", "请求中,请稍后...");
                $.zheui.toast("网络异常,请稍后再试.");
            }
        });

    }


    $.myorder = function() {};

    //确认收货
    function bindConfirmReceipt(arr) {
        $.zheui.bindTouchGoto(arr, function(obj) {
            var _this = obj;
            var ordernum = _this.attr("ordernum");
            mydialog.create(1, "亲，您确认收到此商品了吗？", "确定", "取消");
            $.zheui.bindTouchGoto($(".dialog_box").find(".btn_confirm"), function(obj) {
                mydialog.hide();
                $.zheui.loadingbar("show", "请求中,请稍后...");
                $.ajax({
                    type: "POST",
                    url: "/orders/h5_m/confirm?order_id=" + ordernum,
                    success: function(data) {
                        $.zheui.loadingbar("hide", "请求中,请稍后...");
                        console.log(data);
                        var _data = data;
                        if (typeof _data == "object") {
                            $.zheui.toast(_data.msg);
                            if (_data.ret == 0) {
                                window.location.href = location.href;
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        console.log("网络异常");
                        $.zheui.loadingbar("hide", "请求中,请稍后...");
                        $.zheui.toast("网络异常,请稍后再试.");
                    }
                });
            });
            $.zheui.bindTouchGoto($(".dialog_box").find(".btn_cancel"), function(obj) {
                var _this = obj;
                mydialog.hide();
            });
        });
    }
    bindConfirmReceipt($(".btn_confirm_receipt"));
    //延长收货
    function bindDelayReceipt(arr) {
        $.zheui.bindTouchGoto(arr, function(obj) {
            var _this = obj;
            if(_this.attr("delayflag")==1){
                return;
            }
            var orderid = _this.attr("orderid");
            var sellerid = _this.attr("sellerid");
            mydialog.create(1, "确定延长3天收货吗？每笔订单只能延迟一次哦。", "确定", "取消");
            $.zheui.bindTouchGoto($(".dialog_box").find(".btn_confirm"), function(obj) {
                mydialog.hide();
                $.zheui.loadingbar("show", "请求中,请稍后...");
                $.ajax({
                    type: "POST",
                    url: "/orders/h5/addDelayRecord?orderid="+orderid+"&sellerid="+sellerid,
                    success: function(data) {
                        $.zheui.loadingbar("hide", "请求中,请稍后...");
                        console.log(data);
                        var _data = data;
                        if (typeof _data == "object") {
                            $.zheui.toast(_data.msg);
                            if (_data.ret == 0) {
                                window.location.href = location.href;
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        console.log("网络异常");
                        $.zheui.loadingbar("hide", "请求中,请稍后...");
                        $.zheui.toast("网络异常,请稍后再试.");
                    }
                });
            });
            $.zheui.bindTouchGoto($(".dialog_box").find(".btn_cancel"), function(obj) {
                var _this = obj;
                mydialog.hide();
            });
        });
    }
    bindDelayReceipt($(".btn_delay_receipt"));
    //删除订单
    function bindDeleteOrder(arr) {
        $.zheui.bindTouchGoto(arr, function(obj) {
            var _this = obj;
            var ordernum = _this.attr("ordernum");
            mydialog.create(1, "删除后不可恢复，您确定要删除这个订单吗？", "确定", "取消");
            $.zheui.bindTouchGoto($(".dialog_box").find(".btn_confirm"), function(obj) {
                mydialog.hide();
                $.zheui.loadingbar("show", "请求中,请稍后...");
                $.ajax({
                    type: "POST",
                    url: "/orders/h5_m/delete?order_id=" + ordernum,
                    success: function(data) {
                        var _data = data;
                        $.zheui.loadingbar("hide", "请求中,请稍后...");
                        if (typeof _data == "object") {
                            $.zheui.toast(_data.msg);
                            if (_data.ret == 0) {
                                window.location.href = location.href;
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        console.log("网络异常");
                        $.zheui.loadingbar("hide", "请求中,请稍后...");
                        $.zheui.toast("网络异常,请稍后再试.");
                    }
                });
            });
            $.zheui.bindTouchGoto($(".dialog_box").find(".btn_cancel"), function(obj) {
                var _this = obj;
                mydialog.hide();
            });
        });
    }
    bindDeleteOrder($(".btn_delete_order"));

    //去付款
    function gopay(orderid) {
        //console.log(1);
        $.zheui.bindTouchGoto($(".select_pay").find(".ord_paym"), function(obj) {
            var _this = obj;
            var pay_type = _this.attr("pay_type");
            $.cookie.set("pay_type_cookie", pay_type); //存储默认支付方式
            mydialog.hide();
            $.zheui.loadingbar("show", "获取支付信息中...");
            if(orderid.indexOf(",")>-1){
                cartPay.cartpay(orderid.split(","), pay_type);
            }else{
                pay.unpay(orderid, pay_type);
            }
        });
        $.zheui.bindTouchGoto($(".bg_layer"), function(obj) {
            var _this = obj;
            mydialog.hide();
        });
    }

    //获取支付方式

    function getPayType(cheapType,orderid,reduceMsg) {
        if(reduceMsg){
            var htmlstr = '<div class="order-dialog-head"><h2>请选择支付方式</h2><span class="tit-msg">'+reduceMsg+'</span></div><div class="select_pay"><div class="loading">正在加载支付方式</div></div>';
        }else{
            var htmlstr = '<div class="order-dialog-head"><h2 class="order-dialog-tit">请选择支付方式</h2></div><div class="select_pay"><div class="loading">正在加载支付方式</div></div>';
        }
        mydialog.create(2, htmlstr);
        var platform_type = $.zheui.getUrlKeyVal('platformType') ? $.zheui.getUrlKeyVal('platformType') : "m";
        var product_type = "zhe800";
        var ver = $.zheui.getUrlKeyVal('platformType') ? "1.0.0" : "1.3.2";
        $.ajax({
            type: "GET",
            url: "/orders/client/get_pay_type_v2.json?n=" + Math.random(),
            data: {
                "platform_type": platform_type,
                "product_type": product_type,
                "pay_type": "",
                "ver": ver,
                "check_flag": false,
                "mj_flag":(cheapType==101)?1:0
            },
            success: function(data) {
                console.log(data);
                var _data = JSON.parse(data);
                if (_data.ret == 1) {
                    $(".select_pay").find(".loading").html("支付方式加载失败，请稍后再试");
                }
                if (_data.ret == 0) {
                    var htmlstr = "";
                    var data_data = _data.data;
                    var data_hidden=_data.data_hidden;
                    if (data_data.length == 0) {
                        $(".select_pay").find(".loading").html("暂无支付方式");
                    } else {
                        for (var i = 0; i < data_data.length; i++) {
                            var pay_type = data_data[i].pay_type;
                            var pay_intro=data_data[i].activity_title?data_data[i].activity_title:data_data[i].intro;
                            var pay_intro_color=data_data[i].activity_title?"#e63b53":"#b9b9b9";
                            htmlstr += "<div class=\"ord_paym\" pay_type=\"" + pay_type + "\">";
                            htmlstr += "<div class=\"ord_payml\"><img src='" + data_data[i].logo_img + "'></div>";
                            if(data_data[i].pic){
                                htmlstr += "<div class=\"ord_paymm\"><span>" + data_data[i].title + "</span><span style='color:#e63b53 '>" + pay_intro + "</span></div>";
                                htmlstr += "<div class=\"ord_paymr\"><span class='tuijian_pic'><i><img src='"+data_data[i].pic+"' width='21px' height='11px'/></i></span></div>";
                            }else{
                                htmlstr += "<div class=\"ord_paymm\"><span>" + data_data[i].title + "</span><span style='color:"+pay_intro_color+"'>" + pay_intro + "</span></div>";
                            }
                            htmlstr += "</div>";
                        }
                        if(data_hidden.length){
                            htmlstr +="<div class='morepay_btn'><span class='more_title'>更多支付方式</span><span class='morepay_ico'></span></div>";
                            htmlstr +="<div class='more_paytype'>";
                            for (var i = 0; i < data_hidden.length; i++) {
                                var pay_intro=data_hidden[i].activity_title?data_hidden[i].activity_title:data_hidden[i].intro;
                                var pay_intro_color=data_hidden[i].activity_title?"#e63b53":"#b9b9b9";
                                htmlstr += "<div class=\"ord_paym\" pay_type=\"" + data_hidden[i].pay_type + "\">";
                                htmlstr += "<div class=\"ord_payml\"><img src='" + data_hidden[i].logo_img + "'></div>";
                                if (data_hidden[i].pic) {
                                    htmlstr += "<div class=\"ord_paymm\"><span>" + data_hidden[i].title + "</span><span style='color:#e63b53 '>" + pay_intro + "</span></div>";
                                    htmlstr += "<div class=\"ord_paymr\"><span class='tuijian_pic'><i><img src='" + data_hidden[i].pic + "' width='21px' height='11px'/></i></span></div>";
                                } else {
                                    htmlstr += "<div class=\"ord_paymm\"><span>" + data_hidden[i].title + "</span><span style='color:"+pay_intro_color+"'>" + pay_intro + "</span></div>";
                                }
                                htmlstr += "</div>";
                            }
                            htmlstr +="</div>";
                        }
                        $(".select_pay").html(htmlstr);
                        mydialog.pos();
                        gopay(orderid);
                        var moretype_flag=false;
                        $.zheui.bindTouchGoto($(".morepay_btn"), function(){
                            if(!moretype_flag){
                                $(".morepay_btn .morepay_ico").css("-webkit-transform","rotate(270deg)");
                                $(".more_paytype").show();
                                mydialog.pos();
                            }else{
                                $(".morepay_btn .morepay_ico").css("-webkit-transform","rotate(90deg)");
                                $(".more_paytype").hide();
                                mydialog.pos();
                            }
                            moretype_flag=!moretype_flag;
                        });
                    }
                }
            },
            timeout: 20000,
            error: function() {
                console.log("网络异常");
                $(".select_pay").find(".loading").html("网络异常,请稍后再试");
            }
        });
        $.zheui.bindTouchGoto($(".bg_layer"), function(obj) {
            var _this = obj;
            mydialog.hide();
        });
    }

    function bindGopay(arr) {
        //console.log(3);
        $.zheui.bindTouchGoto(arr, function(obj) {
            var _this = obj;
            var orderid = _this.attr("ordernum");
            var cheapType=_this.attr("cheapAmountType");  //订单类型  默认0：无；1：1元抢；2：限时抢；101：平台满减
            if(cheapType == 101){
                getReduceInfo(_this,2);
            }else{
                if ($(".select_pay .ord_paym").length) {
                    if($(".tit-msg").length){
                        $(".order-dialog-head").html('<h2 class="order-dialog-tit">请选择支付方式</h2>');
                    }
                    mydialog.show();
                } else {
                    getPayType(cheapType,orderid);
                }
            }
        });
    }
    bindGopay($(".btn_gopay"));

    //加载物流信息
    function loadLogisticsInfo() {
        var logistics_track = $('.logistics_track');
        var loadstr = '<div class="nofound loading">数据加载中...</div>';
        logistics_track.append(loadstr);
        if (typeof express_data == "object") {
            $.ajax({
                type: "POST",
                url: "/orders/h5_m/wuliu_detail?express_id=" + express_data.express_id + "&express_no=" + express_data.express_no,
                dataType: "json",
                success: function(data) {
                    console.log(data);
                    var _data = data;
                    if (typeof _data == "object") {
                        if (_data.ret == 0) {
                            $(".loading").hide();
                            var htmlstr = '<ul class="track_list">';
                            htmlstr += '<li class="now"><p>' + _data.data[0].desc + '</p>' +
                                '<p>' + _data.data[0].time + '</p><span class="ico"><i></i></span></li>';
                            for (var i = 1; i < _data.data.length; i++) {
                                htmlstr += '<li class="old"><p>' + _data.data[i].desc + '</p>' +
                                    '<p>' + _data.data[i].time + '</p><span class="ico"></span></li>';
                            }
                            htmlstr += '</ul>';
                            logistics_track.append(htmlstr);
                        } else {
                            $(".logistics_track .nofound").text(_data.msg);
                        }
                    }
                },
                timeout: 20000,
                error: function() {
                    console.log("网络异常");
                    $(".logistics_track .nofound").text("网络异常,请稍后再试");
                }
            });

        } else {
            $(".logistics_track .nofound").text("数据读取失败");
        }

    }
    loadLogisticsInfo();

    window.onpopstate=function(){
        choosebox.closeBox();
    }

    //[订单详情页]加载最近的物流信息
    function loadNowLogisticsInfo() {
        var logistics_info = $(".logistics_info");
        $.ajax({
            type: "POST",
            url: "/orders/h5/wuliu_detail?express_id=" + express_data.express_id + "&express_no=" + express_data.express_no,
            dataType: "json",
            success: function(data) {
                console.log(data);
                var _data = data;
                if (typeof _data == "object") {
                    var htmlstr = '<div class="logistics_txt"><span class="ico"><i></i></span>';
                     if (_data.ret == 0) {
                        htmlstr += '<p class="gre">' + _data.data[0].desc + '</p><p>' + _data.data[0].time + '</p>';
                    } else {
                        htmlstr += '<p>' + _data.msg + '</p>';
                    }
                    htmlstr += '</div><i class="right_arr"></i>'
                    logistics_info.html(htmlstr);
                }
            },
            timeout: 20000,
            error: function() {
                console.log("网络异常");
                logistics_info.find(".loading").text("网络异常,请稍后再试");
            }
        });
    }
    if ($('.logistics_info').length && typeof express_data == "object") {
        loadNowLogisticsInfo();
        $.zheui.bindTouchGoto($('.logistics_info'), function(obj) {
            var _this = obj;
            var url = mod_protocol.addProtocol(_this.attr("data-url"));
            var title = _this.attr("title");
            if (url) {
                window.location.href = url;
            }
        });
    }
    //订单列表和订单详情按钮跳转
    function bindBtnGoto(arr) {
        $.zheui.bindTouchGoto(arr, function(obj) {
            var _this = obj;
            var url = mod_protocol.addProtocol(_this.attr("data-url"));
            var title = _this.attr("title");
            var type = _this.attr("type");
            var platform_type = $.zheui.getUrlKeyVal('platformType');
            //配合易信url存储支付方式
            if (url) {
                //退货 退款
                if (type == 1) {
                    box_scrollTop = $("body").scrollTop();
                    var toptit = '请选择要发起的申请';
                    var data_qq = $("#refund_type").attr("data-qq");
                    // var htmlstr1 = '<span class="seller_qq" id="seller_qq2" data-qq="' + data_qq + '">联系商家</span>';
                    var htmlstr1 = '<span class="btn_close">关闭</span>';
                    var htmlstr2 = '<dl data-url="' + url + '&refund_type=1" title="' + title + '"><dt><span class="img_apply1"></span></dt><dd><span class="tit">仅退款不退货</span><span>提前与商家协商好退款金额，可更快捷的完成此退款流程</span></dd></dl>' +
                        '<dl data-url="' + url + '&refund_type=2" title="' + title + '"><dt><span class="img_apply2"></span></dt><dd><span class="tit">退货</span><span>收到货物后发起此申请，可更快捷的完成退货流程</span></dd></dl>';
                    choosebox.create(toptit, htmlstr1, htmlstr2);
                    choosebox.openBox();
                    $.zheui.addhistory();
                    //已发货 仅退款不退货，退货选择
                    $.zheui.bindTouchGoto($(".choose_by dl"), function(obj) {
                        var dl_this = obj;
                        var dl_url = dl_this.attr("data-url");
                        var title = dl_this.attr("title");
                        // window.history.go(-1);
                        choosebox.closeBox();
                        window.location.href =dl_url;
                    });
                    $.zheui.bindTouchGoto($(".btn_close"),function(obj){
                        var _this = obj;
                        window.history.go(-1);
                    });
                } else {

                    if (platform_type) {
                    url = url + '&platformType=' + platform_type;
                }
                    window.location.href = url;
                }
            } else {
                var msg = _this.attr("msg");
                if (msg) {
                    $.zheui.toast(msg);
                }
            }

        });
    }
    bindBtnGoto($(".commodity_btn").find(".btn_item"));
    bindBtnGoto($(".botm-btn").find(".btn"));


    //启动卖家qq
    $.zheui.bindTouchGoto($("#seller_qq1"), function(obj) {
        var _this = obj;
        var qq = _this.attr("data-qq");
        im_fun.open_IM_QQ({
            "type" : "afterSaleIM",
            "orderid": im_data.orderid,
            "qq" : qq,
            "parm" : {"d":"3"}
        });

    });

    //物流详情页
    $.zheui.bindTouchGoto($("#seller_qq3"), function(obj) {
        var _this = obj;
        var qq = _this.attr("data-qq");
        im_fun.open_IM_QQ({
            "type" : "afterSaleIM",
            "orderid": im_data.orderid,
            "qq" : qq,
            "parm" : {"d":"4"}
        });

    });

    //常见问题跳转 如果有旧连接则跳转新连接(上线着急，未让张辉改动--by liudi)
    if ($(".faq").length) {
        $.zheui.bindTouchGoto($(".faq"), function(obj) {
            var _this = obj;
            var url = _this.attr("data-url");
            if (url) {
                window.location.href = "http://s.zhe800.com/ms/zhe800hd/app/help/list.html?pid=27&cgp=1&ptitle=%E8%AE%A2%E5%8D%95t_t%E7%89%A9%E6%B5%81"
            }
        });
    }

    //联系客服
    function showlayer() {
        var htmlstr = '<div class="zhe800_kf"><span class="ico_close"></span><h2>折800官方客服</h2><p class="txt">客服电话 : <a href="tel:400-0611-800">400-0611-800</a><br>服务时间：9:00-18:00 7x9小时 全年无休</p><p class="txt">Q Q:&nbsp;800061025<br>服务时间：9:00-22:00 7x13小时 全年无休</p><p>其他时间 : 请先留言</p></div>';
        mydialog.create(2, htmlstr);
        var zhe800_kf = $(".zhe800_kf");
        $.zheui.bindTouchGoto(zhe800_kf.find(".ico_close"), function(obj) {
            var _this = obj;
            mydialog.hide();
        });
        $.zheui.bindTouchGoto($(".bg_layer"), function(obj) {
            var _this = obj;
            mydialog.hide();
        });
    }
    $.zheui.bindTouchGoto($("#zheKf"), function(obj) {
        var _this = obj;
        showlayer();
    });

    // 下载浮层
    if(!$(".btn").length){
        $(".order_detail").css("padding-bottom","0");
    }
    myLayer.insertLayer($(".order_detail"), "download2");

});