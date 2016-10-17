/*
 *
 * 账户信息专用js*/

define(function(require, exports, module) {
    var addr_data = require("../common/address_data");

    //初始化地区选择
    function initaddrSelect() {
        var htmlstr = '<option>请选择</option>';
        for (var i = 0; i < addr_data.length; i++) {
            if (addr_data[i].parentid == 1) {
                htmlstr += '<option value="' + addr_data[i].id + '" indx="' + i + '">' + addr_data[i].name + '</option>';
            }
        }
        $(".addr_selec select").eq(0).html(htmlstr);
        changeSelect();
    }

    //级联地区选择
    function changeSelect() {
        var select = $(".addr_selec select");
        select.bind("change", function() {
            var selec_index = Number($(this).attr("index"));
            var n = $(this).get(0).selectedIndex;
            var curr_em = $(this).siblings("em");
            curr_em.text($(this).get(0).options[n].text);
            if (curr_em.hasClass("gray")) {
                curr_em.removeClass("gray");
            }
            $('.addr_selec_item').eq(selec_index).find('em').html('请选择');
            var seled_index = Number($($(this).get(0).options[n]).attr("indx"));
            var htmlstr = '<option>请选择</option>';
            for (var i = 0; i < addr_data.length; i++) {
                if (addr_data[i].parentid == addr_data[seled_index].id) {
                    htmlstr += '<option  value="' + addr_data[i].id + '" indx="' + i + '">' + addr_data[i].name + '</option>';
                }
            }
            select.eq(selec_index).html(htmlstr);
        });
    }

    if ($(".addr_selec").length) {
        initaddrSelect();
    }

    //收款信息验证
    function checkAccountInput() {
        var ischeck = true;
        var input_box = $(".input_box");
        input_box.each(function() {
            var curr_input_box = $(this);
            if (curr_input_box.css("display") != "none") {
                curr_input_box.find("input,select").each(function() {
                    if ($(this).parent().hasClass("txt_input")) {
                        var regstr = $(this).attr("reg");
                        var _val = $(this).val().replace(/[\s]/g, '');
                        if (regstr) {
                            var regarr = regstr.split("#");
                            var msgarr = $(this).attr("msg").split("#");
                            for (var i = 0; i < regarr.length; i++) {
                                var re = new RegExp(regarr[i]);
                                if (!re.test(_val)) {
                                    // $.common.toast({
                                    //     "text": msgarr[i]
                                    // });
                                    $.zheui.toast(msgarr[i]);
                                    ischeck = false;
                                    return false;
                                }
                            }
                        } else {
                            var msgstr = $(this).attr("msg");
                            if (msgstr && _val == '') {
                                // $.common.toast({
                                //     "text": msgstr
                                // });
                                $.zheui.toast(msgstr);
                                ischeck = false;
                                return false;
                            }
                        }
                    } else {
                        var issec = $(this).get(0).selectedIndex;
                        if (!issec) {
                            // $.common.toast({
                            //     "text": "请选择地址信息"
                            // });
                            $.zheui.toast("请选择地址信息");
                            ischeck = false;
                            return false;
                        }
                    }
                });
            }
        });
        return ischeck;
    }

    //获取用户输入的账户信息
    function getAccountVal() {
            var valstr = "";
            var input_box = $(".input_box");
            input_box.each(function() {
                var curr_input_box = $(this);
                if (curr_input_box.css("display") != "none") {
                    valstr = "&account_type=" + curr_input_box.attr("account_type");
                    curr_input_box.find("input,select").each(function() {
                        if ($(this).parent().hasClass("txt_input")) {
                            valstr += "&" + $(this).attr("name") + "=" + $(this).val();
                        } else {
                            var n = $(this).get(0).selectedIndex;
                            var val = $(this).get(0).options[n].value;
                            var text = $(this).get(0).options[n].text;
                            valstr += "&" + $(this).attr("name") + "=" + val + "&" + $(this).attr("txt_name") + "=" + text;
                        }
                    });
                }
            });
            valstr = valstr.substring(1, valstr.length);
            return valstr;
        }
    //提交账户信息
    function submitAccount() {
        $.zheui.loadingbar("show", "信息提交中，请稍后...");
        $.ajax({
            type: "POST",
            url: "/orders/complain_m/deduct/save",
            data: getAccountVal(),
            dataType: "json",
            success: function(data) {
                $.zheui.loadingbar("hide", "信息提交中，请稍后...");
                console.log(data);
                var _data = data;
                if (typeof _data == "object") {
                    $.zheui.toast(_data.msg);
                    if (_data.ret == 0) {
                        window.location.href = $.zheui.domain + "/orders/complain_m/detail?complain_id=" + _data.data;
                    }
                }
            },
            timeout: 20000,
            error: function() {
                console.log("网络异常");
                $.zheui.loadingbar("hide", "信息提交中，请稍后...");
                $.zheui.toast("网络异常,请稍后再试.");
            }
        });
    }
    $.zheui.bindTouchGoto($("#submitAccount"), function(obj) {
        if (checkAccountInput()) {
            submitAccount();
        }
    });


    //执行tab切换
    if ($(".tab_tit").length) {
        $.zheui.bindTouchGoto($(".tab_tit li"), function(obj, i) {
            var _this = obj;
            _this.addClass("on").siblings().removeClass("on");
            $(".tab_content").find(".input_box").eq(i).show().siblings(".input_box").hide();
        });
    }


    // $("#inputRefundAmount").bind("input",function(){
    //     checkRefundAmount();
    // });

    //  if($("#inputRefundAmount").length && $("#inputRefundAmount").val()!=""){
    //  checkRefundAmount();
    //  }


});