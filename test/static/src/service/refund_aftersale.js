/*
 *
 *退款申请页和售后申请页专用js */

define(function(require, exports, module) {

    var form = require("./form");
    require('./upload_pic');

    /*点击是否收到货按钮*/
    $.zheui.bindTouchGoto($(".is_receive .radio_item"), function(obj) {
            var _this = obj;
            var _val = _this.attr("val");
            if (!_this.hasClass("noclick")) {
                _this.addClass("on").siblings().removeClass("on");
                $("input[name='reason']").val("");
                $(".is_receive").find("input").val(_val);
                if ($(".refund_type").find("input").val() == 1) {
                    if (typeof _cause == "object") {
                        console.log(_val + "jj");
                        selecCause(_cause['t' + _val]);
                    } else {
                        $.zheui.toast("数据读取错误");
                    }
                } else {
                    if (typeof _cause == "object") {
                        console.log("3+l");
                        selecCause(_cause['t3']);
                    } else {
                        $.zheui.toast("数据读取错误");
                    }
                }
            }
        })

    /*点击售后类型按钮*/
    $.zheui.bindTouchGoto($(".refund_type .radio_item"), function(obj) {
            var _this = obj;
            _this.addClass("on").siblings().removeClass("on");
            var _val = _this.attr("val");
            $(".refund_type").find("input").val(_val);
            $("input[name='reason']").val("");
            if (_val == 1) {
                $(".flow_pic").find("span").removeClass().addClass("refund_flow");
                if ($("#is_receive").css("display") == "none") {
                    $(".is_receive").find("input").val("1");
                    if (typeof _cause == "object") {
                        console.log("3+z");
                        selecCause(_cause['t3']);
                    } else {
                        $.zheui.toast("数据读取错误");
                    }
                } else {
                    var type = $(".is_receive").find("input").val();
                    if (typeof _cause == "object") {
                        console.log(type + "jj");
                        selecCause(_cause['t' + type]);
                    } else {
                        $.zheui.toast("数据读取错误");
                    }
                    $(".is_receive .radio_item").eq(1).removeClass("noclick");

                }

            } else {
                $(".flow_pic").find("span").removeClass().addClass("aftersale_flow");
                if (typeof _cause == "object") {
                    console.log("3+z");
                    selecCause(_cause['t3']);
                } else {
                    $.zheui.toast("数据读取错误");
                }
                if ($("#is_receive").css("display") != "none") {
                    $(".is_receive .radio_item").eq(0).addClass("on");
                    $(".is_receive .radio_item").eq(1).addClass("noclick");
                    if ($(".is_receive .radio_item").eq(1).hasClass("on")) {
                        $(".is_receive .radio_item").eq(1).removeClass("on");
                    }
                    $(".is_receive").find("input").val("1");
                }

            }

        })

    /*初始化修改申请仅退款页面的退款原因*/
    if ($("input[name='is_receive']").val() && $("input[name='refund_type']").val() == 1) {
        var is_receive_val = $("input[name='is_receive']").val();
        if (typeof _cause == "object") {
            selecCause(_cause['t' + is_receive_val]);
        } else {
            $.zheui.toast("数据读取错误");
        }
    }

    if ($("input[name='refund_type']").val()) {
        var refund_type_val = $("input[name='refund_type']").val();
        if (refund_type_val == 1) {
            $(".flow_pic").find("span").removeClass().addClass("refund_flow");
        } else {
            $(".flow_pic").find("span").removeClass().addClass("aftersale_flow");
            $(".is_receive").find("input").val("1");
            if (typeof _cause == "object") {
                console.log("3+z");
                selecCause(_cause['t3']);
            } else {
                $.zheui.toast("数据读取错误");
            }
        }
    }
    if ($("input[name='reason']").val()) {
        var reason_val = $("input[name='reason']").val();
        var itemarr = $(".selec_cause .item");
        itemarr.each(function() {
            var id = $(this).attr("id");
            if (id == reason_val) {
                $(this).addClass("on");
            }
        })
    }

    /*加载退款申请页面和维权申请页面的退款原因*/
    if ($(".refund_apply").length || $(".weiquan_apply").length) {
        if (typeof _cause == "object") {
            selecCause(_cause);
        } else {
            $.zheui.toast("数据读取错误");
        }
    }
    /*初始化退款原因*/
    function selecCause(data){
        $(".selec_cause").html("");
        var htmlstr = '';
        for(var i=0;i<data.length;i++){
            htmlstr+='<span class="item" id="'+data[i].id+'">'+data[i].text+'</span>';
        }
        $(".selec_cause").append(htmlstr);
        $.zheui.bindTouchGoto($(".selec_cause .item"),function(obj){
            var _this = obj;
            var _id = _this.attr("id");
            _this.addClass("on").siblings().removeClass("on");
            $(".refund_cause").find("input").val(_id);
        });
    }

    //仅退款 申请和修改
    var refundApply = function() {
        var _val = form.getInputVal($(".input_box").find("input,textarea"));
        $.zheui.loadingbar("show", "请求中，请稍后...");
        $.ajax({
            type: "POST",
            url: "/orders/refund_m/refund/save.json",
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
                $.zheui.toast("网络异常,请稍后再试.");
            }
        });
    };

    $.zheui.bindTouchGoto($("#submitRefund"), function(obj) {
        var _this = obj;
        var inputs = $(".input_box").find("input,textarea");
        var reason_id = $("input[name='reason']").val();
        var evidence = $("input[name='evidence']").val();
        if (form.checkInput(inputs) && form.checkReason(reason_id, reasonArr, evidence)) {
            refundApply();
        }
    });

    //售后 申请和修改
    function aftersaleApply() {
            var _val = form.getInputVal($(".input_box").find("input,textarea"));
            console.log(_val);
            $.zheui.loadingbar("show", "请求中，请稍后...");
            $.ajax({
                type: "POST",
                url: "/orders/refund_m/return/save.json",
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
                    $.zheui.toast("网络异常,请稍后再试.");
                }
            });
        }

    $.zheui.bindTouchGoto($("#submitAftersale"), function(obj) {
        var _this = obj;
        var inputs = $(".service_w").find("input,textarea");
        var reason_id = $("input[name='reason']").val();
        var evidence = $("input[name='evidence']").val();
        if (form.checkInput(inputs) && form.checkReason(reason_id, reasonArr, evidence)) {
            aftersaleApply();
        }
    });

    $("#inputRefundAmount").bind("input", function() {
        checkRefundAmount();
    });
    if ($("#inputRefundAmount").length && $("#inputRefundAmount").val() != "") {
        checkRefundAmount();
    }
    //检查用户输入退款金额
    function checkRefundAmount() {
        var inputVal = $("#inputRefundAmount").val().trim();
        var maxnum = $("#inputRefundAmount").attr("maxnum");
        $("#txt_input_msg").html("");
        if (inputVal.length) {
            var patt = new RegExp("^[0-9]+([\.][0-9]{0,2})?$");
            if (!patt.test(inputVal)) {
                $("#txt_input_msg").html("您输入的格式错误！");
                return false;
            } else {
                if (parseFloat(inputVal) > parseFloat(maxnum)) {
                    $("#txt_input_msg").html("退款金额不可超过" + maxnum + "元");
                    return false;
                } else {
                    var order_id = $("input[name='order_id']").attr("value");
                    var product_id = $("input[name='product_id']").attr("value");
                    var sku_num = $("input[name='sku_num']").attr("value");
                    $.ajax({
                        type: "GET",
                        url: "/orders/refund_m/deduct/info?amount=" + inputVal + "&order_id=" + order_id + "&product_id=" + product_id + "&sku_num=" + sku_num + "&n=" + Math.random(),
                        dataType: "json",
                        success: function(data) {
                            var _data = data;
                            if (typeof _data == "object") {
                                if (_data.ret == 0) {
                                    var moneyAmount=Number(_data.data.moneyAmount);        /*退现金*/
                                    var couponAmount=Number(_data.data.couponAmount);     /*退优惠劵*/
                                    var scoreAmount=_data.data.scoreAmount;         /*退积分金额*/
                                    var scoreNum=Number(_data.data.scoreNum);                     /*退积分数量*/
                                    var discountByOrderAmount=Number(_data.data.discountByOrderAmount); /*拍下立减优惠金额*/
                                    //var freightInsureAmount = Number(_data.data.freightInsureAmount); /*已付运费险的金额*/
                                    var orders_status= $("#inputRefundAmount").attr("orders_status"); // 表示订单状态，1为未发货，2为已发货
                                    var discountAmount = Number(_data.data.discountAmount); //活动优惠
                                    var str = "实退现金"+(moneyAmount)+"元";
                                    if(orders_status && orders_status=="2"){
                                        if(typeof freightInfo =="object" && freightInfo.amount && Number(freightInfo.amount)){
                                            str += "，不包含运费补贴卡的"+freightInfo.amount+"元";
                                        }
                                    }else if(orders_status && orders_status=="1"){
                                        if(typeof freightInfo =="object" && freightInfo.amount && Number(freightInfo.amount)){
                                            str += "，发货前全额退款成功后将退还运费补贴卡的"+freightInfo.amount+"元";
                                        }
                                    }
                                    if(couponAmount||scoreNum||discountByOrderAmount||discountAmount){
                                        if(discountByOrderAmount){
                                            str += "，不含立减活动优惠的"+discountByOrderAmount+"元";
                                        }
                                        if(couponAmount && !scoreNum){
                                            str += "，不含优惠券抵用的"+couponAmount+"元";
                                        }
                                        if(!couponAmount && scoreNum){
                                            str += "，抵现"+scoreAmount+"元的"+scoreNum+"积分将退还至积分账户";
                                        }
                                        if(discountAmount){
                                            str += "，不含活动优惠"+discountAmount+"元";
                                        }
                                    }
                                    $("#txt_input_msg").html(str);                                
                                }
                            }
                        },
                        timeout: 20000,
                        error: function() {
                            console.log("网络异常");
                            $.zheui.toast("网络异常,请稍后再试.");
                        }
                    });
                }
            }
        }
    }

});