define(function(require, exports, module) {

    var mychoose_box = require('../common/choose_box');
    var myform = require('./form');
    var dialog = require('../common/dialog');
    var mydialog = new dialog();


    // 初始化
    $("#btn_kd").addClass("on");
    $("#py").hide();
    // $("#ct").css("position","relative");
    window.onpopstate = function() {
        mychoose_box.closeBox();
    }

    $.zheui.bindTouchGoto($("#btn_kd"), function() {
        $("#kd").show();
        $("#py").hide();
        $("#btn_kd").addClass("on").siblings().removeClass("on");

    });
    $.zheui.bindTouchGoto($("#btn_py"), function() {
        $("#py").show();
        $("#kd").hide();
        $("#btn_py").addClass("on").siblings().removeClass("on");
    });

    //生成物流列表
    function createWuliuList(obj) {
        // 填写物流公司
        var _data = obj;
        var _kd_html = "";
        var _btn_html = "";
        _kd_html += '<ul>';
        for (var i = 0; i < _data.length; i++) {
            _kd_html += '<li class="choose_item" id=' + _data[i].id + '><span>' + _data[i].text + '</span><i></i></li>';
        }
        _kd_html += '</ul>';
        _btn_html = '<span class="btn_close">关闭</span>';
        mychoose_box.create("提交物流信息", _btn_html, _kd_html);
        $.zheui.addhistory();
        //关闭
        $.zheui.bindTouchGoto($(".btn_close"), function() {
            // mychoose_box.closeBox();
            window.history.go(-1);
        });
        $.zheui.bindTouchGoto($(".choose_item"), function(obj) {
            var _id = "",
                _txt = "";
            _id = obj.text();
            if (_id) {
                $(".selec_val").text(_id);
                $(".selec_val").removeClass("gray");
                $("#hide_kd").val(obj.attr("id"));
            }
            mychoose_box.closeBox();
        });
    };

    //打开
    $.zheui.bindTouchGoto($(".selec_item"), function() {
        createWuliuList(_kd_data);
        mychoose_box.openBox();
    });


    //提交维权物流信息
    //arr表示此次遍历的input区域  btnType区别售后(1)或维权(2)两个页面的提交按钮
    function submitWuliu(arr, btnType) {
            var _val = myform.getInputVal(arr);
            console.log(_val);
            $.zheui.loadingbar("show", "请求中，请稍后...");
            if (btnType == 1) {
                $.ajax({
                    type: "POST",
                    url: "/orders/refund_m/return/saveExpress.json",
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
            } else {
                $.ajax({
                    type: "POST",
                    url: "/orders/complain_m/return/saveExpress.json",
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
                        $.zheui.toast("网络异常,请稍后再试.");
                    }
                });
            }
        }
        //提交物流信息 按钮绑定事件
    $.zheui.bindTouchGoto($("#submitWuliu"), function(obj) {
        var _this = obj;
        var inputs = "";
        var sub_type = $("#submitWuliu").attr("type");
        if ($("#btn_kd").hasClass("on")) {
            inputs = $("#kd").find("input,textarea");
            if (myform.checkInput(inputs)) {
                submitWuliu(inputs, sub_type);
            }
        } else {
            inputs = $("#py").find("input,textarea");
            if (myform.checkInput(inputs)) {
                submitWuliu(inputs, sub_type);
            }
        }
    });
});