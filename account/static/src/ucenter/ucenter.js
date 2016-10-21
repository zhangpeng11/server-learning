/**
 * 个人中心专用js
 */
define(function(require, exports, module) {
    var $ = require("zepto");
    require('../common/base');
    var base64 = require('../common/base64');
    var track = require("../common/track_v2");
    //初始化htt-header
    track.init("M");
    //添加pos_type和pos_value
    var track_data = {
      pos_value:"user",
      pos_type:"user",

    };
    //将track_data写入cookie
    $.tracklog.addCokkie(track_data);
    var base64str = new base64();

    var islogin = false;
    var isucenter = $(".u_center_w").length ? true : false;



    //获取登录状态
    if (isucenter) {
        $.ajax({
            type: "GET",
            url: "https://passport.zhe800.com/j/h5/auth/islogin?callback=?" + "&n=" + Math.random(),
            // url: "//th5hsm.zhe800.com/api/auth/islogin?callback=?&n=" + Math.random(),
            dataType: "jsonp",
            success: function(data) {
                if (typeof data == "object") {
                    islogin = data.islogin;
                    if (islogin) {
                        $(".login").show();
                        $('#quit').show();
                        getuserInfo();
                    } else {
                        $(".no_login").show();
                        $('#quit').hide();
                        var url = encodeURIComponent($.zheui.domain + "/m/ucenter/uindex");
                        $.zheui.bindTouchGoto($("#btnGologin"), function() {
                            window.location.href = "//m.zhe800.com/login?return_to=" + url;
                            //马上登录打点统计
                            $.tracklog.action("tologin",track_data,"");
                        });
                    }
                }
            }
        });

        //back
        $.zheui.bindTouchGoto($(".back"), function() {
            window.location.href = "//m.zhe800.com/";
        });
    };

    //获取用户信息
    function getuserInfo() {
        var ppinf = $.cookie.get("ppinf");
        //如果从cookie中未获取到用户信息显示未登录状态
        if (ppinf == null || ppinf == undefined) {
            return false;
        }
        var uinfarr = ppinf.split("|");
        var u_jsonstr = base64str.utf8to16(base64str.decodeBase64(uinfarr[uinfarr.length - 1]));
        var u_json = JSON.parse(u_jsonstr);
        $("#userName").text(u_json.userid);
    }

    //获取用户身份
    var user_role = $.cookie.get("user_role") || "";
    var isStudent = $.cookie.get("student") || "";
    if ($("#myRole").length) {
        var role_name = "";
        if (user_role == "1") {
            role_name = "男";
        } else if (user_role == "4") {
            role_name = "女";
        } else if (user_role == "6") {
            role_name = "辣妈";
        }
        $("#myRole").text(role_name);
    }
    //身份选择初始化
    if (user_role) {
        if (user_role == "6") {
            $(".select_item.mother").find("div").addClass("on").siblings(".select_item").removeClass('on');
        } else {
            $(".student div").css("display", "inline-block");
            if (user_role == "1") {
                $(".select_item.boy").find("div").addClass("on").siblings(".select_item").removeClass('on');
            } else if (user_role == "4") {
                $(".select_item.girl").find("div").addClass("on").siblings(".select_item").removeClass('on');
            }
        }
    }
    if (isStudent) {
        if (isStudent == 1) {
            $(".student div").addClass("on");
        };
    }

    //选择身份
    var roleVal;

    function selecRole() {
    	var _urlfrom = $.zheui.getUrlKeyVal("from");
        $.zheui.bindTouchGoto($(".select_item"), function(obj) {
            var _this = obj;
            roleVal = _this.attr('user_role');
            _this.find("div").addClass('on');
            _this.siblings(".select_item").find("div").removeClass('on');
        	// #108803 不点击确定时，不再记录身份
            //$.cookie.set("user_role", roleVal);
            if (roleVal == "1" || roleVal == "4") {
                $(".student div").css("display", "inline-block");
            } else if (roleVal == "6") {
            	// #108803 不点击确定时，不再记录身份
                //$.cookie.set("student", "0");
                $(".student div").removeClass('on');
                $(".student div").css("display", "none");
                $(".role").hide();
                $(".btn_sure").hide();
                $(".selecttime").show();
                $.zheui.bindTouchGoto($(".btn_confirm"), function() {
                    var year = document.querySelector("#year");
                    var month = document.querySelector("#month");
                    var y_val = year.options[year.selectedIndex].value;
                    var m_val = month.options[month.selectedIndex].value;
                    $.cookie.set("year", y_val);
                    $.cookie.set("month", m_val);
                	// #108803 点击确定时设置身份
                    $.cookie.set("user_role", $(".select_item .on").parent().attr("user_role"));
                    setTimeout(function() {
                        if (_urlfrom == "ucenter") {
                            window.location.href = "/m/ucenter/uindex";
                        } else {
                            window.location.href = "//m.zhe800.com/";
                        }
                    }, 400);

                });
            }
        });
        $.zheui.bindTouchGoto($(".btn_sure span"), function () {
        	// #108803 点击确定时设置身份
        	$.cookie.set("user_role", $(".select_item .on").parent().attr("user_role"));

            if ($(".student").find("div").hasClass("on")) {
                $.cookie.set("student", "1");
            } else {
                $.cookie.set("student", "0");
            }
            setTimeout(function() {
                if (_urlfrom == "ucenter") {
                    window.location.href = "/m/ucenter/uindex";
                } else {
                    window.location.href = "/m.zhe800.com/";
                }
            }, 400);
        });
        $.zheui.bindTouchGoto($(".student"), function(obj) {
            var _this = obj;
            _this.find("div").toggleClass('on');
        });

        $.zheui.bindTouchGoto($(".selecttime .jump"), function () {
        	// #108803 在辣妈的跳过里面，直接设置身份为辣妈
        	$.cookie.set("user_role", $(".select_item .on").parent().attr("user_role"));

            if (_urlfrom == "ucenter") {
                window.location.href = "/m/ucenter/uindex";
            } else {
                window.location.href = "/m.zhe800.com/";
            }
        });

    	// #108803 显示保存的宝宝出生年月
        var selectedYear = $.cookie.get("year"), selectedMonth = $.cookie.get("month");
        selectedYear && $("#year").val(selectedYear);
        selectedMonth && $("#month").val(selectedMonth);
    }
    selecRole();

    //个人中心打点统计
    $(".item").find("a").click(function() {
        var _this = $(this);
        var item_index = $(".item a").index(_this);
        switch(item_index){
            case 0:
                $.tracklog.action("myorder",track_data,"");
                break;
            case 1:
                $.tracklog.action("shopcart",track_data,"");
                break;
            case 2:
                $.tracklog.action("coupon",track_data,"");
                break;
            case 3:
                $.tracklog.action("userrole",track_data,"");
                break;
            case 4:
                $.tracklog.action("address",track_data,"");
                break;     
            case 5:
                $.tracklog.action("im",track_data,"{eventtype:zhe800service}");
                break; 
            case 6:
                $.tracklog.action("im",track_data,"{eventtype:zhe800phone}");
                break; 
            case 7:
                $.tracklog.action("password",track_data,"");
                break; 
            default:
        }
    });

    //注销
    $.zheui.bindTouchGoto($("#quit"), function(obj) {
        var url = encodeURIComponent(window.location.href);
        window.location.href = "https://passport.tuan800.com/wap2/logout?domain=zhe800.com&return_to=" + url;
    });
});