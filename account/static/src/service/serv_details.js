/*
 *
 *售后详情页专用js */

define(function(require, exports, module) {
    var mychoose_box = require('../common/choose_box');
    var dialog = require('../common/dialog');
    var mydialog = new dialog();

    //im切换模块
    var im_fun = require("../im/im");
    //im初始化，判断开关是否打开
    var im_data;
    var order_url = window.location.href;
    if(order_url.indexOf("refund_m/refund/detail")>-1){
        im_data = IM_data;
    }else{
        im_data = {};
    }
    im_fun.sellerSwitch(im_data.sellerid);
    
    window.onpopstate = function() {
        mychoose_box.closeBox();
    }

    //取消维权申请
    var cancelComplain = function(complain_id) {
        $.zheui.loadingbar("show", "请求中，请稍后...");
        $.ajax({
            type: "POST",
            url: "/orders/complain_m/cancel",
            data: complain_id,
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

    //取消维权申请 绑定事件
    $("#cancelComplain").unbind();
    $.zheui.bindTouchGoto($("#cancelComplain"), function(obj) {
        var _this = obj;
        var complain_id = "complain_id=" + _this.attr("complain_id");
        // if (refund_count == 1) {
        //     mydialog.create(1, "每个商品最多只可申请2次退款哦~确定要取消申请嘛？", "是", "否");
        //     mydialog.show();
        // } else {
        //     mydialog.create(1, "取消后，本商品将无法再次申请退款/退货喽~是否仍要取消申请？", "是", "否");
        //     mydialog.show();
        // }
        mydialog.create(1,"取消申请后，折800客服将不介入处理，您需要和商家协商解决，确认取消吗？", "是", "否");
        mydialog.show();
        $.zheui.bindTouchGoto($(".btn_confirm"), function() {
            cancelComplain(complain_id);
            mydialog.hide();
        });
        $.zheui.bindTouchGoto($(".btn_cancel"), function() {
            mydialog.hide();
        });
    });

    //取消 退货申请，退款申请
    var cancelApply = function(refund_id) {
        $.zheui.loadingbar("show", "请求中，请稍后...");
        $.ajax({
            type: "POST",
            url: "/orders/refund_m/refund/cancel.json",
            data: refund_id,
            dataType: "json",
            success: function(data) {
                // $.zheui.loadingbar("hide", "请求中，请稍后...");
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

    //取消退款申请
    $.zheui.bindTouchGoto($("#cancelRefund"), function(obj) {
        var _this = obj;
        var refund_id = "refund_id=" + _this.attr("refund_id");
        if (refund_count == 1) {
            mydialog.create(1, "每个商品最多只可申请2次退款哦~确定要取消申请嘛？", "是", "否");
            mydialog.show();
        } else {
            mydialog.create(1, "取消后，本商品将无法再次申请退款/退货喽~是否仍要取消申请？", "是", "否");
            mydialog.show();
        }

        $.zheui.bindTouchGoto($(".btn_confirm"), function() {
            cancelApply(refund_id);
            mydialog.hide();
        });
        $.zheui.bindTouchGoto($(".btn_cancel"), function() {
            mydialog.hide();
        });
    });

    //取消退货申请
    $.zheui.bindTouchGoto($("#cancelAftersale"), function(obj) {
        var _this = obj;
        var refund_id = "refund_id=" + _this.attr("refund_id");

        mydialog.create(1, "确定要取消退货申请吗", "确定", "取消");
        $.zheui.bindTouchGoto($(".btn_confirm"), function() {
            cancelApply(refund_id);
            mydialog.hide();
        });
        $.zheui.bindTouchGoto($(".btn_cancel"), function() {
            mydialog.hide();
        });

    });

    //维权反馈
    var weiquanFeedback = function(complain_id, buyer_feedback,buyer_feedback_reason) {
        $.zheui.loadingbar("show", "请求中，请稍后...");
        $.ajax({
            type: "POST",
            url: "/orders/complain_m/feedback/save.json",
            data: {
                "complain_id": complain_id,
                "buyer_feedback": buyer_feedback,
                "buyer_feedback_reason":buyer_feedback_reason || ''
            },
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
    $.zheui.bindTouchGoto($(".btn_satisfy").find("span"), function(obj) {
        var _this = obj;
        var buyer_feedback = _this.attr("buyer_feedback");
        var complain_id = _this.parent().attr("complain_id");
        if(buyer_feedback == 2){
            var  str = "",
                 btnStr = "";
            btnStr = '<span class="btn_close">关闭</span>';     
            str = '<div class="text-box"><img src="http://i0.tuanimg.com/ms/zhe800h5/dist/img/text_02.png"></div>'+
                  '<textarea rows="6" id="unsatisfy-text" placeholder="请用力的写在这里吧~"></textarea>'+
                  '<div class="absolute_area">'+
                  '<span class="unsatisfy-arrow"></span>'+
                  '<span class="unsatisfy-xiaoba"></span>'+
                  '</div>'+
                  '<div id="btn-unsatisfy-submit">提交满意度反馈</div>';
            mychoose_box.create("问题反馈", btnStr, str);
            mychoose_box.openBox();
            $.zheui.addhistory();
            //关闭
            $.zheui.bindTouchGoto($(".btn_close"), function() {
                // mychoose_box.closeBox();
                window.history.go(-1);
            });
            $.zheui.bindTouchGoto($("#btn-unsatisfy-submit"),function(obj){
                var _this = obj;
                //获取不满意原因
                var $unsatisfyText = $("#unsatisfy-text");
                var _val =$unsatisfyText.val();
                weiquanFeedback(complain_id, buyer_feedback,_val);
                mychoose_box.closeBox();
            });  
        }else{
            weiquanFeedback(complain_id, buyer_feedback);
        }
    });

    //售后详情按钮跳转
    $.zheui.bindTouchGoto($(".btn_area").find(".btn_item"), function(obj) {
        var _this = obj;
        var url = _this.attr("data-url");
        var title = _this.attr("title");
        if (url) {
            setTimeout(function() {
                window.location.href = url;
            }, 300);

        }
    });

    //联系商家
    //绑定启动商家qq事件
    $.zheui.bindTouchGoto($(".btn_con_business"), function(obj) {
        var _this = obj;
        var qq = _this.attr("data-qq");
        // if (qq) {
        //     openQQ(qq);
        // }
        im_fun.open_IM_QQ({
            "type" : "afterSaleIM",
            "orderid": im_data.orderid,
            "qq" : qq,
            "parm" : {"d":"6"}
        });
        
    });

    //启动商家qq
    // function openQQ(qq_data) {
    //     var _arr = qq_data.split(",");
    //     if (_arr.length > 1) {
    //         var htmlstr = '<ul class="select_qq">';
    //         for (var i = 0; i < _arr.length; i++) {
    //             htmlstr += '<li data-qq="' + _arr[i] + '"><i class="ico"></i>商家客服' + (i + 1) + '号</li>';
    //         }
    //         htmlstr += '</ul>';
    //         mydialog.create(htmlstr);
    //         $.zheui.bindTouchGoto($(".select_qq li"), function(obj) {
    //             var _this = obj;
    //             var qq = _this.attr("data-qq");
    //             if (qq) {
    //                 window.location.href = "mqq://im/chat?chat_type=wpa&uin=" + qq + "&version=1&src_type=web&web_src=h5.m.zhe800.com cmp=com.tencent.mobileqq/.activity.JumpActivity";
    //                 setTimeout(function() {
    //                     mydialog.hide();
    //                 }, 400);
    //             }
    //         });
    //         $.zheui.bindTouchGoto($(".bg_layer"), function(obj) {
    //             mydialog.hide();
    //         });
    //     } else {
    //         window.location.href = "mqq://im/chat?chat_type=wpa&uin=" + _arr[0] + "&version=1&src_type=web&web_src=h5.m.zhe800.com cmp=com.tencent.mobileqq/.activity.JumpActivity";
    //     }
    // }

    //联系客服
    function showlayer() {
        // var htmlstr = '<div class="zhe800_kf"><span class="ico_close"></span><h2>折800官方客服</h2><p class="txt">电话 : 400-0611-800<br>在线客服: <a href="mqq://im/chat?chat_type=wpa&uin=800061025&version=1&src_type=web&web_src=h5.m.zhe800.com cmp=com.tencent.mobileqq/.activity.JumpActivity">折800客服</a></p><p>在线时间：9:00-23:00 7x12小时 全年无休<br>其他时间 : 请先留言</p></div>';
        var htmlstr = '<div class="zhe800_kf"><span class="ico_close"></span><h2>折800官方客服</h2><p class="txt">客服电话 : 400-0611-800<br>服务时间：9:00-21:00 7x12小时 全年无休</p><p class="txt">在线客服: <a href="mqq://im/chat?chat_type=wpa&uin=800061025&version=1&src_type=web&web_src=h5.m.zhe800.com cmp=com.tencent.mobileqq/.activity.JumpActivity">折800客服</a><br>服务时间：8:00-23:00 7x15小时 全年无休</p><p>其他时间 : 请先留言</p></div>';
        // mydialog.create(htmlstr);
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
    $.zheui.bindTouchGoto($(".btn_con_zhe"), function(obj) {
        var _this = obj;
        showlayer();
    });

    //显示物流信息
    $.zheui.bindTouchGoto($(".link_wuliu"), function() {
        if (typeof express_data == "object") {
            var _btn_html = "";
            var _wuliu_info = "";
            _btn_html = '<span class="btn_close">关闭</span>';

            //初始化
            _wuliu_info = '<div class="logistics_track">' +
                '<div class="wuliu-info">' +
                '<span>快递公司:' + express_data.express_text + '</span>' +
                '<span>订单编号:' + express_data.express_no + '</span>' +
                '</div>' +
                '<div class="nofound loading">数据加载中...</div>' +
                '</div>';

            //创建滑层
            mychoose_box.create("物流跟踪", _btn_html, _wuliu_info);
            mychoose_box.openBox();
            $.ajax({
                type: "POST",
                url: "/orders/h5/wuliu_detail?express_id=" + express_data.express_id + "&express_no=" + express_data.express_no,
                dataType: "json",
                success: function(data) {
                    console.log(data);
                    var _data = data;
                    var logistics_track = $('.logistics_track');

                    if (typeof _data == "object") {
                        if (_data.ret == 0) {
                            $(".loading").hide();
                            //生成物流信息
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
            //关闭弹层
            $.zheui.bindTouchGoto($(".btn_close"), function() {
                mychoose_box.closeBox();
            });

        } else {
            $(".logistics_track .nofound").text("数据读取失败");
            console.log("数据读取失败");
        }
    });

    var zhan = $('<div class="zhan"></div>');
    zhan.css({
        width: '100%',
        height: '50px'
    });
    var count = 0;

    function isVisibility(arr) {
        var ScroTop = $(window).scrollTop();
        var scrollH = $(document).height();
        var itemTop = arr.offset().top;
        var itemH = arr.height() + 25 + "px";
        var winH = $(window).height();
        var status = ScroTop > (itemTop + itemH) || ScroTop < (itemTop - winH);

        if (!status) {
            $(".botm_bar").addClass("float_bar");
            if (count == 0) {
                $('#ct').append(zhan);
                count = 1;
            }
        } else {
            $(".botm_bar").removeClass("float_bar");
            count = 0;
            if ($('.zhan')) {
                $('.zhan').remove();
            }

        }
        if (scrollH - ScroTop == winH) {
            // console.log("到底了");
            $(".botm_bar").removeClass("float_bar");
            count = 0;
            if ($('.zhan')) {
                $('.zhan').remove();
            }
        }
    }
    $(window).bind("scroll", function() {
        var messge_item = $(".messge_box ").find(".messge_item").eq(1);
        if(messge_item.length>0){
            isVisibility(messge_item);
        }
        

    });

});