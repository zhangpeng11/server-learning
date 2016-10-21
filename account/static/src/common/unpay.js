define(function(require, exports, module) {
    var $ = require("zepto");
    var dialog = require("../common/dialog");
    var mydialog = new dialog();
    /**
     * 支付模块
     * @param
     * id：订单号
     * type：支付类型
     * payback:native支付成功后回调函数
     */
    exports.unpay = function(id, type, payback, callback) {
        var order_id = id;
        $.cookie.set("myhd_order_id", id); //微信活动需传参数
        if (type == "unionpaywap" || type == "alipaywap" || type == "baifubaowap") {
            $.ajax({
                type: "POST",
                url: "/orders/h5_m/pay",
                //新增return_url参数
                data: {
                    "order_id": order_id,
                    "pay_channel": type,
                    "return_url": $.zheui.domain + "/orders/h5_m/ret_suc"
                },
                success: function(data) {
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    if (data.ret == "ok" || data.ret == "0") {
                        $.cookie.set("last_paytype",type);
                        var data_url = data.data.url;
                        window.location.href = data_url;
                    } else {
                        $.zheui.toast("哎哟，付款没有成功哦");
                    }
                },
                timeout: 20000,
                error: function() {
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    $.zheui.toast("哎哟，付款没有成功哦");
                }
            });
        } else if (type == "yixinpub") {
            $.ajax({
                type: "POST",
                url: "/orders/sf_yx/pay?n=" + Math.random(),
                data: {
                    "order_id": order_id,
                    "pay_channel": type,
                    "additional_info": "127.0.0.1",
                    "return_url": $.zheui.domain + "/orders/h5/ret_suc"
                },
                success: function(data) {
                    console.log(data);
                    $.cookie.set("last_paytype",type);
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    //传入公众号名称，时间戳，随机串，Package扩展字段，签名方式和PaySign 签名
                    YixinJSBridge.invoke('getBrandYCPayRequest', data, function(res) {
                        // res暂无值。若成功，弹出支付成功确认页，用户点击完成后跳转至callbackURL所指向的url；
                        // 若失败，停留在页面。
                    });
                },
                timeout: 20000,
                error: function() {
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    $.zheui.toast("哎哟，付款没有成功哦");
                }
            });
        } else if (type.indexOf("unionpayacpwap") >= 0) {
            $.ajax({
                type: "POST",
                url: "/orders/h5_m/pay",
                data: {
                    "order_id": order_id,
                    "pay_channel": type,
                    "return_url": $.zheui.domain + "/orders/h5_m/ret_suc"
                },
                success: function(data) {
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    if (data.ret == "ok") {
                        $.cookie.set("last_paytype",type);
                        var wap_data = JSON.parse(data.data.url);
                        var url = wap_data.url;
                        var method = wap_data.method;
                        var wapdata = wap_data.data;
                        var _html = "";
                        _html += "<form id='unionpayacpwap_pay' style='display:none' action='" + url + "' method='" + method + "'>";
                        _html += "<input type='hidden' name='txnType' id='txnType' value='" + wapdata.txnType + "' />";
                        _html += "<input type='hidden' name='payTimeout' id='payTimeout' value='" + wapdata.payTimeout + "' />";
                        _html += "<input type='hidden' name='frontUrl' id='frontUrl' value='" + wapdata.frontUrl + "' />";
                        _html += "<input type='hidden' name='currencyCode' id='currencyCode' value='" + wapdata.currencyCode + "' />";
                        _html += "<input type='hidden' name='channelType' id='channelType' value='" + wapdata.channelType + "' />";
                        _html += "<input type='hidden' name='merId' id='merId' value='" + wapdata.merId + "' />";
                        _html += "<input type='hidden' name='orderTimeoutInterval' id='orderTimeoutInterval' value='" + wapdata.orderTimeoutInterval + "' />";
                        _html += "<input type='hidden' name='customerIp' id='customerIp' value='" + wapdata.customerIp + "' />";
                        _html += "<input type='hidden' name='txnSubType' id='txnSubType' value='" + wapdata.txnSubType + "' />";
                        _html += "<input type='hidden' name='txnAmt' id='txnAmt' value='" + wapdata.txnAmt + "' />";
                        _html += "<input type='hidden' name='version' id='version' value='" + wapdata.version + "' />";
                        _html += "<input type='hidden' name='signMethod' id='signMethod' value='" + wapdata.signMethod + "' />";
                        _html += "<input type='hidden' name='backUrl' id='backUrl' value='" + wapdata.backUrl + "' />";
                        _html += "<input type='hidden' name='certId' id='certId' value='" + wapdata.certId + "' />";
                        _html += "<input type='hidden' name='encoding' id='encoding' value='" + wapdata.encoding + "' />";
                        _html += "<input type='hidden' name='bizType' id='bizType' value='" + wapdata.bizType + "' />";
                        _html += "<input type='hidden' name='orderId' id='orderId' value='" + wapdata.orderId + "' />";
                        _html += "<input type='hidden' name='signature' id='signature' value='" + wapdata.signature + "' />";
                        _html += "<input type='hidden' name='txnTime' id='txnTime' value='" + wapdata.txnTime + "' />";
                        _html += "<input type='hidden' name='accessType' id='accessType' value='" + wapdata.accessType + "' />";
                        _html += "</form>";
                        $("body").append(_html);
                        $("#unionpayacpwap_pay").get(0).submit();
                    } else {
                        $.zheui.toast("哎哟，付款没有成功哦");
                    }
                },
                timeout: 20000,
                error: function() {
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    $.zheui.toast("哎哟，付款没有成功哦");
                }
            })
        } else if (type.indexOf("weixinwap") >= 0) {
            //支付是否完成
            //$.zheui.domain + "/orders/h5_m/ret_suc_weixinwap" ，此链接已做判断。如果支付成功跳到支付成功页，如果没有支付跳到订单列表页
            setTimeout(function() {
                mydialog.create(1, "微信支付中", "已完成支付", "支付遇到问题");
                $.zheui.bindTouchGoto($(".dialog_box").find(".btn_confirm"), function(obj) {
                    var _this = obj;
                    mydialog.hide();
                    window.location.href = $.zheui.domain + "/orders/h5_m/ret_suc_weixinwap";
                });
                $.zheui.bindTouchGoto($(".dialog_box").find(".btn_cancel"), function(obj) {
                    var _this = obj;
                    mydialog.hide();
                    window.location.href = $.zheui.domain + "/orders/h5_m/ret_suc_weixinwap";
                });
            }, 1000);

            $.ajax({
                type: "POST",
                url: "/orders/h5_m/pay",
                data: {
                    "order_id": order_id,
                    "pay_channel": type,
                    "additional_info": "127.0.0.1"
                },
                success: function(data) {
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    if (data.ret == "ok" || data.ret == "0") {
                        $.cookie.set("last_paytype",type);
                        var safari_flag=navigator.userAgent.match(/(iPhone\sOS\s[\d_].*\/9.*\sMobile\/.*\sSafari+)/) ? true : false;
                        var data_url = data.data.url;
                        $(".deeplink").remove();
                        if(safari_flag){
                             window.location=data_url;
                        }else{
                            $("body").append('<iframe class="deeplink hide" src="' + data_url + '"></iframe>');
                        }

                    } else {
                        $.zheui.toast("哎哟，付款没有成功哦");
                    }
                },
                timeout: 20000,
                error: function() {
                    $.zheui.loadingbar("hide", "支付中，请稍等");
                    $.zheui.toast("哎哟，付款没有成功哦");
                }
            });
        }

        if (typeof callback == "function") {
            callback();
        }
    };

});