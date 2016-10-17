/*
 *
 *发表留言专用js */

define(function(require, exports, module) {

    var form = require("./form");
    require('./upload_pic');

    //售后中发表留言
    var submitComment = function() {
            var inputs = $(".input_box").find("input,textarea");
            if (form.checkInput(inputs)) {
                var _val = form.getInputVal(inputs);
                $.zheui.loadingbar("show", "请求中，请稍后...");
                $.ajax({
                    type: "POST",
                    url: "/orders/refund_m/comment/save.json",
                    data: _val,
                    dataType: "json",
                    success: function(data) {
                        console.log(data);
                        var _data = data;
                        if (typeof _data == "object") {
                            $.zheui.loadingbar("hide", "请求中，请稍后...");
                            $.zheui.toast(_data.msg);
                            if (_data.ret == 0) {
                                window.location.href = $.zheui.domain + "/orders/refund_m/refund/detail?order_id=" + _data.data.orderId + "&product_id=" + _data.data.productId + "&sku_num=" + _data.data.skuNum;
                            }
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        console.log("网络异常");
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        $.zheui.toast("网络异常，请稍后再试.");
                    }
                });
            }
        }
    //维权中的发表留言
    var weiquanSubmitComment = function() {
        var inputs = $(".input_box").find("input,textarea");
        if (form.checkInput(inputs)) {
            var _val = form.getInputVal(inputs);
            $.zheui.loadingbar("show", "请求中，请稍后...");
            $.ajax({
                type: "POST",
                url: "/orders/complain_m/evidence/save.json",
                data: _val,
                dataType: "json",
                success: function(data) {
                    console.log(data);
                    var _data = data;
                    if (typeof _data == "object") {
                        $.zheui.loadingbar("hide", "请求中，请稍后...");
                        $.zheui.toast(_data.msg);
                        if (_data.ret == 0) {
                            window.location.href = $.zheui.domain + "/orders/complain_m/detail?complain_id=" + _data.data;
                        }
                    }
                },
                timeout: 20000,
                error: function() {
                    console.log("网络异常");
                    $.zheui.loadingbar("hide", "请求中，请稍后...");
                    $.zheui.toast("网络异常，请稍后再试.");
                }
            });
        }
    }

    $.zheui.bindTouchGoto($("#submitGuestbook"), function(obj) {
        var _this = obj;
        submitComment();
    });
    $.zheui.bindTouchGoto($("#weiquanSubmitGuestbook"), function(obj) {
        var _this = obj;
        weiquanSubmitComment();
    });

});