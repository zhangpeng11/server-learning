/**
 * 精选预告  xuping 2015/8/3
 */
define(function(require, exports, module) {
    require("zepto");
    require('../common/base');
    require("../common/imglazyload");
    require("../common/callnative");
    var track_v2 = require("../common/track_v2");
    var Swipe = require("../common/swipe"),
        iScroll = require("../common/iscroll"),
        bigData = require('../common/bd'),
        exposure = require("../common/exposure_v2");
    // AdaptApp = require("../common/adaptApp");
    var page_from = $.zheui.getUrlKeyVal("pub_page_from") || "m";
    page_from = page_from.indexOf("zheclient") > -1 ? "zheclient" : page_from;
    var track_data = {
        "pos_type": "forcast",
        "refer": "home"
    };
    track_v2.init(page_from);
    var sendnative_data = {
        pos_type: "focst",
        pos_value: "",
        model_name: "deallist",
        model_item_index: 0,
        model_id: "",
        model_index: ""
    };
    //banner的页面流转
    var sendnative_bannerdata = {
        pos_type: "focst",
        pos_value: "",
        model_name: "banner",
        model_id: '',
        model_item_index: 0,
        model_id: "",
        model_index: "",
        sourcetype: ""
    };
    //全局变量
    var wph = {
        m_url: $.zheui.protocol + "//m.zhe800.com/m/detail/detail",
        wx_url: "//th5.m.zhe800.com/h5/weixin/shopdeal",
        h5_url: "//th5.m.zhe800.com/h5/shopdeal",
        out_url: $.zheui.protocol + "//out.zhe800.com/jump?"
    };
    var foreshow = {
        /*
      listData:商品列表的相关信息(是否请求接口加载数据，是否有下一页，加载第几页)  
      userinfo:用户相关信息
      isWindScroll:是窗口滚动还是div滚动
    */
        config: {
            listData: {
                "all": {
                    isLoad: false,
                    nextPage: false,
                    pageInd: 1,
                    loading: false,
                    tempPoint: 0
                }
            },
            userInfo: {
                userType: '',
                userRole: '',
                student: ''
            },
            support: false,
            isWinScroll: false,
            curName: "all"
        },
        init: function() {
            alert(1111);
            // 检测是否支持webp
            this.isWebp = false;
            var _this = this;
            $.zheui.check_iswebp(function(i) {
                if ($.os.android) {
                    _this.isWebp = i;
                }
            });
            //导航外框
            this.winH = window.innerHeight;
            //banner大图的显示
            this.slideWrap = $(".slide_img").get(0);
            this.$slideImg = $(this.slideWrap).find(".imgList");
            this.$slideDot = $(this.slideWrap).find(".dotList");
            this.up_flag = true;
            this.$navWrap = $("#navWrap");
            this.$swipeWrap = $(".swipe");
            this.$subnavlist = this.$navWrap.find(".subnavlist");
            this.$navWrapdown = this.$navWrap.find(".sels_down ul");
            this.startTime = new Date().getTime();
            if (page_from == "zheclient") {
                $.common.get_allmethod("$.calljs.get_allmethodcallback");
                var _this = this;
                // 获取版本信息
                var native_Info = {};
                $.common.get_nativeinfo("$.calljs.get_nativeinfocallback1");
                $.calljs.get_nativeinfocallback1 = function(data) {
                    if (data) {
                        native_Info = JSON.parse(data);
                        var version = parseInt(native_Info.version.replace(/\./g, ''));
                        $.cookie.set("bd_chart_fc", native_Info["X-Zhe800filter"]);
                    }
                };
                $.calljs.get_allmethodcallback = function(data) {
                    _this.allmethod = JSON.parse(data);
                    if (_this.allmethod.view_didappear) {
                        $.cookie.set("__alarm_status", '{"status":"0"}');
                        $.common.view_didappear("$.calljs.view_didappear_callback");

                        //返回列表后的数据同步
                        $.calljs.view_didappear_callback = function() {
                            var status = JSON.parse($.cookie.get("__alarm_status")).status;
                            var dealid = JSON.parse($.cookie.get("__alarm_status")).dealid;
                            var currli = $(".li_" + dealid);
                            if ($.os.ios) {
                                $.common.view_didappear("$.calljs.view_didappear_callback");
                            }

                            //特卖商城商品状态同步
                            if (currli.attr("source_type") == "1") {
                                if (status == 1) {
                                    //设置成功，已经设置，返回按钮变灰
                                    currli.find(".buttons").attr("data-alarm", 'cancel_alarm').addClass("alarm");
                                }
                                if (status == 2) {
                                    //取消成功的按钮，恢复正常的状态
                                    currli.find(".buttons").attr("data-alarm", 'set_alarm').removeClass("alarm");
                                }
                            } else {

                                //淘宝，天猫的商品需再次向native获取最新数据
                                $.common.get_alarmdealdata({
                                    "num": "100"
                                }, "$.calljs.get_alarmdealdata");
                            }

                        };
                    } else {
                        if (_this.allmethod.refresh == "true") {
                            //支持新的协议
                            $.common.refresh({
                                "status": "true"
                            });
                        } else {
                            //返回刷新前一页
                            $.common.back_reload();
                        }
                    }
                };
                _this.openShare();
            }
            if (page_from == "zheclient") {
                this.getClientUser();
                // AdaptApp.hideTopBar();
                $.common.get_alarmdealdata({
                    "num": "100"
                }, "$.calljs.get_alarmdealdata");
                $.calljs.get_alarmdealdata = function(data) {
                    if (data) {
                        _this.config.alarmData = JSON.parse(data);

                        //返回列表后，更新淘宝，天猫的商品状态
                        var __alarmstr = $.cookie.get("__alarm_status");
                        if (__alarmstr) {
                            var dealid = JSON.parse(__alarmstr).dealid;
                            var currli = $(".li_" + dealid);
                            if (currli.attr("source_type") == "0") {
                                var status = false;
                                for (var i = 0; i < _this.config.alarmData.length; i++) {
                                    if (_this.config.alarmData[i].dealid == dealid) {
                                        status = true;
                                    }
                                }
                                if (status) {
                                    currli.find(".buttons").attr("data-alarm", 'cancel_alarm').addClass("alarm");
                                } else {
                                    currli.find(".buttons").attr("data-alarm", 'set_alarm').removeClass("alarm");
                                }
                            }
                        }

                    }
                }
            } else if (page_from = "m") {
                // $("#topBar").show();
                this.getMuser();
                bigData.init();
            }
            this.gototop();
        },
        isSetAlarm: function(id, alarmData) {
            if (alarmData && alarmData.length) {
                for (var i = 0, len = alarmData.length; i < len; i++) {
                    if (alarmData[i].dealid == id) {
                        return true;
                    }
                }
            } else {
                return false;
            }

        },
        // 客户端页面分享功能
        openShare: function() {
            $.ajax({
                type: 'GET',
                url: '//th5.m.zhe800.com/socialshare/content?share_type=22&callback=jsonp1',
                dataType: "jsonp",
                jsonp: "callback",
                success: function(data) {
                    var share_type = data.share_type,
                        share_title = data.share_title,
                        infos = data.infos[0],
                        share_platform = data.share_method,
                        share_small_pic = data.share_small_pic,
                        recommend_pic = data.recommend_pic,
                        middle_page = data.url;
                    //获取客户端支持的所有协议
                    $.common.get_allmethod("$.calljs.get_allmethodcallback");
                    $.calljs.get_allmethodcallback = function(data) {
                        __allmethod = JSON.parse(data);
                        console.log("open share", data);
                        if (__allmethod.open_share) {
                            var params = {
                                "out_url": middle_page,
                                "content": infos,
                                "title": share_title,
                                "pic_url": share_small_pic,
                                "share_platform": share_platform,
                                "source": 22,
                                "_ga": {
                                    "share_source": "forcast"
                                }
                            };
                            $.common.open_share(params);
                        }
                    };
                },
                timeout: 20000,
                error: function() {
                    console.log("error");
                }
            })
        },
        getClientUser: function() {
            var time = new Date().getTime();
            $.common.get_nativeinfo("$.calljs.get_nativeinfocallback");
            var _this = this;
            $.calljs.get_nativeinfocallback = function(data) {

                if (data) {
                    var data = JSON.parse(data);
                    if (data.utype.indexOf("_") != -1) {
                        var temp = data.utype;
                        temp = temp.split("_");
                        _this.config.userInfo = {
                            userType: temp[0] || '',
                            userRole: temp[1] || '',
                            student: temp[2] || ''
                        }
                    } else {
                        _this.config.userInfo = {
                            userType: data.usertype || '',
                            userRole: data.userrole || '',
                            student: data.school || ''
                        }
                    }
                    _this.config.support = true;
                    _this.getNav();
                    _this.domBanner();
                }

            };
            var f = setInterval(function() {
                if (!_this.config.support) {
                    var endTime = new Date().getTime();
                    if ((endTime - _this.startTime) > 500) {
                        clearInterval(f);
                        _this.getNav();
                        _this.domBanner();
                    }
                } else {
                    clearInterval(f);
                }
            }, 10);
        },
        getMuser: function() {
            this.getNav();
            this.domBanner();
        },
        /*
       导向横向滑动
      */
        navScroll: function() {
            var scrollWidth = 0,
                _this = this;
            this.$navList.forEach(function(item) {
                $(item).attr("data-left", scrollWidth);
                scrollWidth += $(item).width();
            });
            scrollWidth += 10;
            this.$subnavlist.width(scrollWidth);
            this.scrollObj = new iScroll(jcy_navList, {
                snap: false,
                momentum: false,
                hScrollbar: false,
                onScrollEnd: function() {}
            });
        },
        /**
         * 绑定touch事件，消除冒泡阻塞
         */
        bindTouchEvent: function($els, callback) {
            var isMove;
            $els.each(function(index, ele) {
                $(ele).bind({
                    "touchstart": function(e) {
                        touch_startX = e.touches[0].pageX;
                        touch_startY = e.touches[0].pageY;
                        isMove = false;
                    },
                    "touchmove": function(e) {
                        touch_moveEndX = e.touches[0].pageX;
                        touch_moveEndY = e.touches[0].pageY;
                        touch_X = touch_moveEndX - touch_startX;
                        touch_Y = touch_moveEndY - touch_startY;
                        if (Math.abs(touch_X) >= 3 || Math.abs(touch_Y) >= 3) {
                            isMove = true;
                        }
                    },
                    "touchend": function(e) {
                        if (isMove) {
                            return;
                        }
                        if (typeof callback === "function") {
                            callback($(this), index);
                        }
                    }
                });
            });
        },
        bindTouchEvent2: function($els, callback) {
            var isMove;
            $els.each(function(index, ele) {
                $(ele).bind({
                    "touchstart": function(e) {
                        isMove = false;
                        $(ele).addClass('hover');
                        e.stopPropagation();
                    },
                    "touchmove": function(e) {
                        isMove = true;
                        $(ele).removeClass('hover');
                        e.stopPropagation();
                    },
                    "touchend": function(e) {
                        if (isMove) {
                            return;
                        }
                        e.stopPropagation();
                        if (typeof callback === "function") {
                            callback($(this), index);
                        }
                        $(ele).removeClass('hover');
                    }
                });
            });
        },
        navCur: function(ind) {
            var urlName = this.$navList.eq(ind).attr("url-name"),
                pageInd = this.config.listData[urlName].pageInd,
                curObj = this.$navList.eq(ind);
            this.config.curName = urlName;
            this.$navList.eq(ind).addClass("selected").siblings().removeClass("selected");
            this.$navlist_down.eq(ind).addClass("selected").siblings().removeClass("selected");
            /*      if(_this.config.curName=='all'){
          $(".slide_img").show();
           _this.$slideImg.height()==0?$(".list_all .wrap_content").css('margin-top','42.5px'):$(".list_all .wrap_content").css('margin-top','0px');
           }else{
             $(".slide_img").hide();
           }*/

            if (ind >= 1) {
                this.scrollObj.scrollToElement(curObj.prev().get(0), 200);
            } else if (ind == 0) {
                this.scrollObj.scrollTo(0, 0, 200);
            }
            document.body.scrollTop = 0;
            this.config.isWinScroll = false;

            this.listInit(urlName, pageInd, function() {
                if ($(".list_" + urlName).attr("data-height") != _this.$swipeWrap.height()) {
                    _this.$swipeWrap.height($(".list_" + urlName).attr("data-height") + "px");
                }
            });
        },
        getNav: function() {
            var _this = this;
            $.ajax({
                type: 'GET',
                url: '/forecast/tags/v3?user_role=' + _this.config.userInfo.userRole + '&user_type=' + _this.config.userInfo.userType,
                success: function(data) {
                    console.log('getNav,data:', data);
                    if (!(data && data.length)) {
                        _this.$navWrap.hide();
                        _this.listInit("all", 1);
                        return;
                    } else {
                        _this.$navWrap.show();
                        _this.$navWrap.find(".icon").show();
                    }
                    var len = data.length;
                    navData = data,
                    navHtml = '',
                    navdown = '',
                    itemStr = '';
                    for (var i = 0; i < len; i++) {
                        // add by wangguanjia 133800,精选预告增加无数据判断，新增字段new_count，为0屏蔽
                        if (navData[i].now_count != 0) {
                            navHtml += '<span class="navItem" url-name="' + navData[i].url_name + '">' + navData[i].category_name + '<i></i></span>';
                            navdown += '<li  url-name="' + navData[i].url_name + '">' + navData[i].category_name + '<span></span></li>';
                            itemStr += '<div class="conItem list_' + navData[i].url_name + '"><div class="wrap_content"></div><div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div><div class="bottom-pic"></div></div>';
                            // $(".conItem").append('<div class="wrap_content"></div><div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div>')
                            _this.config.listData[navData[i].url_name] = {
                                isLoad: false,
                                nextPage: false,
                                pageInd: 1,
                                loading: false,
                                tempPoint: 0
                            }
                        }
                    }

                    _this.$subnavlist.append(navHtml);
                    _this.$navWrapdown.append(navdown);
                    _this.$swipeWrap.find(".swipe-wrap").append(itemStr);

                    _this.$navList = _this.$subnavlist.find("span");
                    _this.$navItems = _this.$navWrap.find(".navItem");
                    _this.$navlist_down = _this.$navWrapdown.find("li");
                    _this.$conItem = _this.$swipeWrap.find(".conItem");
                    _this.subNavHeight = $(".sels_down ul").height();
                    _this.navScroll();
                    _this.navupdown();
                    _this.tabFn();

                    _this.listInit("all", 1);
                    _this.winScroll();

                },
                timeout: 20000,
                error: function() {
                    _this.listInit("all", 1);
                }
            })
        },
        domBanner: function() {
            var _this = this;
            $.ajax({
                type: 'GET',
                // url:'http://m.zhe800.com/tao800/commonbanner.json?ad_type=1&user_role=1&user_type=0',
                url: '/tao800/commonbanner.json?ad_type=1&show_key=forecast&user_role=' + (_this.config.userInfo.userRole || 4) + '&user_type=' + (_this.config.userInfo.userType || 1),
                success: function(data) {

                    if (!(data && data.length)) {
                        $(".slide_img").hide();
                        return;
                    }
                    var len = data.length,
                        imgData = data,
                        bannerHtml = '',
                        dotHtml = '';
                    !(len - 1) && _this.$slideDot.hide();
                    $(".slide_img").css("margin-top", "43px");
                    for (var i = 0; i < len; i++) {
                        bannerHtml += '<li data-id="' + imgData[i].id + '" data-url="' + imgData[i].url + '"data-title="' + imgData[i].title + '">' + '<img src=' + imgData[i].image + '>' + '</li>'
                        dotHtml += '<span ' + ((i == 0) ? 'class="cur"' : '') + '></span>'
                    }
                    console.log(bannerHtml);
                    // _this.$slideImg.css("display","none");
                    _this.$slideImg.html(bannerHtml);

                    _this.$slideImg.height() == 0 ? $(".list_all .wrap_content").css('margin-top', '42.5px') : $(".list_all .wrap_content").css('margin-top', '0px');
                    _this.$slideDot.html(dotHtml);
                    _this.$slideDotList = _this.$slideDot.find("span");
                    sendnative_bannerdata.pos_value = "focst_" + foreshow.config.curName;
                    //alert( sendnative_bannerdata.pos_value);
                    _this.bindTouchEvent(_this.$slideImg.find("li"), function(obj) {
                        $this = obj;
                        var url = obj.attr("data-url"),
                            id = obj.attr("data-id"),
                            title = obj.attr("data-title");
                        sendnative_bannerdata.model_item_index = $this.parent().find("li").index($this) + 1;
                        sendnative_bannerdata.model_id = id;
                        //跳转的方式
                        if (url == '') {
                            return;
                        }
                        if (page_from == "zheclient") {
                            $.tracklog.sendNative(sendnative_bannerdata);
                            $.common.loadpage({
                                "title": title,
                                "url": url
                            });
                        } else {
                            window.location.href = url;
                        }
                    });

                    //banner的横向滑动切换
                    Swipe(_this.slideWrap, {
                        startSlide: 0,
                        continuous: false,
                        auto: 5000,
                        disableScroll: false,
                        stopPropagation: true,
                        callback: function(index, element) {
                            _this.$slideDotList.eq(index).addClass("cur").siblings().removeClass("cur");
                        }
                    });
                },
                timeout: 20000,
                error: function(data) {
                    $(".slide_img").hide();
                }
            });
        },

        winScroll: function() {
            var _this = this;
            $(window).bind("scroll", function() {
                var scrollTop = $(window).scrollTop(),
                    conH = $("#ct").height(),
                    curName = _this.config.curName;
                if (scrollTop + _this.winH + 1000 >= conH && _this.config.listData[curName].nextPage && _this.config.listData[curName].tempPoint != conH) {
                    document.body.scrollTop = scrollTop + 40;
                    _this.config.listData[curName].tempPoint = conH;
                    _this.config.isWinScroll = true;
                    _this.config.listData[curName].pageInd++;

                    _this.listInit(curName, _this.config.listData[curName].pageInd, function() {
                        if ($(".list_" + curName).attr("(data-height)") != _this.$swipeWrap.height()) {
                            _this.$swipeWrap.height($(".list_" + curName).attr("data-height") + "px");
                        }
                    })
                }
            })

        },
        tabFn: function() {
            var _this = this;
            this.swipeObj = Swipe($('.swipe').get(0), {
                startSlide: 0,
                continuous: false,
                disableScroll: false,
                stopPropagation: false,
                callback: function(index, element) {
                    _this.navCur(index);
                },
                transitionEnd: function(index, element) {
                    var urlName = _this.$navList.eq(index).attr("url-name");
                    _this.$conItem.find(".wrap_content").not(".list_" + urlName + " .wrap_content").html("");
                    _this.$navItems.each(function(index, item) {
                        var itemName = $(item).attr("url-name");
                        if (itemName != urlName) {
                            _this.config.listData[itemName] = {
                                isLoad: false,
                                nextPage: false,
                                pageInd: 1,
                                loading: false,
                                tempPoint: 0
                            }
                            $(".list_" + itemName).attr("data-height", _this.winH).find(".loading_more").css("padding-top", "160px");
                            $(".list_" + itemName).find(".bottom-pic,.noData").hide();
                            $(".list_" + itemName).find(".loading_more").show();
                        }
                    })
                    if ($(".list_" + urlName).attr("data-height") != _this.$swipeWrap.height()) {
                        _this.$swipeWrap.height($(".list_" + urlName).attr("data-height") + "px");
                    }
                }
            });
            this.bindTouchEvent(_this.$navList, function(obj, index) {
                _this.swipeObj.slide(index, 500);
                var eventvalue = $(".subnavlist").find(".selected").attr("url-name");
                var eventindex = $(".subnavlist").find(".selected").index() + 1;
                var track_data = {
                    pos_value: "focst",
                    pos_type: "focst",

                };
                $.tracklog.action("tab", track_data, "{eventvalue:" + eventvalue + ",eventindex:" + eventindex + "}");
            });
            this.bindTouchEvent(_this.$navlist_down, function(obj, index) {
                _this.swipeObj.slide(index, 500);
                _this.up_flag = true;
                $("#ct").css("height", "auto");
                $(".sels_down ul").animate({
                    "top": (-1) * _this.subNavHeight
                }, 200);
                $(".opcity").css("display", "none");
                $(".icon_down").animate({
                    "-webkit-transform": 'rotateZ(-360deg)',
                    "transition": "all 0.2s ease-in-out"
                }, 'fast', 'linear', function() {
                    $(".icon_down").css({
                        "-webkit-transform": "rotateZ(0deg)"
                    });
                })
            });
        },
        /*
       下拉的属性
      */
        navupdown: function() {

            _this = this;
            _this.$navupdown = _this.$navWrap.find(".icon");
            _this.$navWrapdown = $(".sels_down ul");
            _this.$navupdown.addClass("navdown");
            this.bindTouchEvent($(".opcity"), function() {
                $(".opcity").css("display", "none");
                $("#ct").css("height", "auto");
                var nav_height = _this.up_flag ? 0 : (-1) * _this.subNavHeight;
                _this.up_flag = !_this.up_flag;
                _this.$navWrapdown.animate({
                    top: (-1) * _this.subNavHeight
                }, 200);
                $(".icon_down").animate({
                    "-webkit-transform": 'rotateZ(-360deg)',
                    "transition": "all 0.2s ease-in-out"
                }, 'fast', 'linear', function() {
                    $(".icon_down").css({
                        "-webkit-transform": "rotateZ(0deg)"
                    });
                })

            });

            this.bindTouchEvent($(".navdown"), function() {
                var nav_height = _this.up_flag ? 0 : (-1) * _this.subNavHeight;
                _this.up_flag = !_this.up_flag;
                _this.$navWrapdown.animate({
                    top: nav_height
                }, 200);
                if (nav_height == 0) {
                    $(".sels_down").css("display", "block");
                    $(".opcity").css("display", "block");
                    swi_height = document.documentElement.clientHeight + 'px';
                    $("#ct").css("height", swi_height);
                    $(".icon_down").animate({
                        "-webkit-transform": 'rotateZ(-180deg)',
                        "transition": "all 0.2s ease-in-out"
                    }, 'fast')
                } else {
                    $(".opcity").css("display", "none");
                    $("#ct").css("height", "auto");
                    $(".icon_down").animate({
                        "-webkit-transform": 'rotateZ(-360deg)',
                        "transition": "all 0.2s ease-in-out"
                    }, 'fast', 'linear', function() {
                        $(".icon_down").css({
                            "-webkit-transform": "rotateZ(0deg)"
                        });
                    })
                }
            });

        },
        formatTen: function(num) {
            return num > 9 ? (num + "") : ("0" + num);
        },
        formatDate: function(date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var minute = date.getMinutes();
            var second = date.getSeconds();
            return year + "-" + this.formatTen(month) + "-" + this.formatTen(day) + " " + this.formatTen(hour) + ":" + this.formatTen(minute) + ":" + this.formatTen(second);

        },
        /**
         * 价格转换为元，小数点后的无效0不要显示
         */
        priceFormat: function(priceValue) {
            if (priceValue % 10 == 0) {
                priceValue = parseInt(priceValue / 10);
                if (priceValue % 10 == 0) {
                    return parseInt(priceValue / 10);
                } else {
                    return priceValue / 10;
                }
            } else {
                return priceValue / 100;
            }
        },
        listInit: function(urlName, pageInd, callback) {
            //区分端的dom结构
            this.config.listData[urlName].loading = false;
            if (!this.config.isWinScroll && this.config.listData[urlName].isLoad) {
                return;
            }
            var _this = this,
                currTablist = $(".list_" + urlName),
                url = '';

            if ($.zheui.getUrlKeyVal("pub_page_from") == "zheclient") {
                // 客户端
                var url = '/forecast/deals/v3?page=' + pageInd + '&per_page=20&image_type=si2&url_name=' + urlName + '&user_type=' + _this.config.userInfo.userType + '&user_role=' + _this.config.userInfo.userRole + '&student=' + _this.config.userInfo.student;
            } else {
                // 非客户端
                var url = '/forecast/deals/v3?page=' + pageInd + '&per_page=20&image_type=si2&url_name=' + urlName + '&user_type=' + _this.config.userInfo.userType + '&user_role=' + _this.config.userInfo.userRole + '&student=' + _this.config.userInfo.student
            };

            $.ajax({
                type: 'GET',
                url: url,
                success: function(data, l, jqXHR) {


                    //渲染dom时pos_value不为空

                    track_data.pos_value = "forcast_" + _this.config.curName;
                    /* if(_this.config.curName=='all'){
                $(".slide_img").show();
               }else{
                 $(".slide_img").hide();
               }*/
                    _this.config.listData[urlName].loading = true;
                    _this.config.listData[urlName].nextPage = data.meta.has_next;

                    _this.config.listData[urlName].isLoad = true;
                    var curTime = new Date(jqXHR.getResponseHeader("Date"));
                    curTime = _this.formatDate(curTime);
                    //console.log(curTime);
                    var dataObj = data.objects;
                    if (dataObj.length > 0) {
                        var htmlStr = '';
                        if (!_this.config.listData[urlName].nextPage) {
                            currTablist.find(".loading_more").hide();
                            currTablist.find(".bottom-pic").show();
                        }
                        for (var i = 0; i < dataObj.length; i++) {
                            var price = _this.priceFormat(dataObj[i].price);
                            var list_price = _this.priceFormat(dataObj[i].list_price);
                            var title = dataObj[i].title;

                            setHtml = "",
                            cancelHtml = "",
                            className = "",
                            typeTxt = "",
                            source_type = dataObj[i].source_type,
                            lijian_price = dataObj[i].coupon_infos && dataObj[i].coupon_infos.lijian_price,
                            coupon_price = dataObj[i].coupon_infos && dataObj[i].coupon_infos.coupon_price,
                            shop_type = dataObj[i].shop_type,
                            youpin = (dataObj[i].deal_type && dataObj[i].deal_type == 3) ? true : false;
                            desClass = "",
                            begintime = dataObj[i].begin_time,
                            alarmClass = "",
                            beginDay = begintime.substring(0, 10),
                            setTxt = "",
                            cancelTxt = "";
                            if (curTime.substring(0, 10) == beginDay) {
                                setTxt = "今天" + begintime.substring(11, 16) + "开抢";
                                cancelTxt = "今天" + begintime.substring(11, 16) + "开抢&nbsp;&nbsp;&nbsp;提醒我";
                            } else {
                                var countTime = (new Date(begintime.substring(0, 10).replace(/-/g, "/")).getTime() - new Date(curTime.substring(0, 10).replace(/-/g, "/")).getTime());
                                if (countTime <= 3600 * 24 * 1000) {
                                    setTxt = "明天" + begintime.substring(11, 16) + "开抢";
                                    cancelTxt = "明天" + begintime.substring(11, 16) + "开抢&nbsp;&nbsp;&nbsp;提醒我"
                                } else if (countTime > 3600 * 24 * 1000 && countTime <= 3600 * 24 * 2 * 1000) {
                                    setTxt = "后天" + begintime.substring(11, 16) + "开抢";
                                    cancelTxt = "后天" + begintime.substring(11, 16) + "开抢&nbsp;&nbsp;&nbsp;提醒我"
                                } else {
                                    setTxt = "开抢提醒";
                                    cancelTxt = "开抢提醒"
                                }
                            }
                            cancelHtml = '<div class="warming bray_invalid"><i class="icon_invalid"></i>' + setTxt + '</div>';
                            setHtml = '<div class="warming valid">' + cancelTxt + '</div>';
                            if (source_type) {

                                if ((lijian_price) && (lijian_price != 0)) {
                                    typeTxt = lijian_price ? "立减" + _this.priceFormat(lijian_price) + "元" : "";
                                    desClass = "des";
                                } else {
                                    typeTxt = "特卖商城";
                                    desClass = "des1";
                                }
                            } else {

                                if (coupon_price && coupon_price != 0) {
                                    typeTxt = coupon_price ? "领券减" + _this.priceFormat(coupon_price) + "元" : "";
                                    desClass = "des";
                                } else {
                                    if (shop_type) {
                                        typeTxt = "去天猫";
                                        desClass = "des1";
                                    } else {
                                        typeTxt = "去淘宝";
                                        desClass = "des1";
                                    }
                                }
                            }
                            if (page_from == "zheclient") {
                                if (_this.isSetAlarm(dataObj[i].id, _this.config.alarmData)) {
                                    alarmClass = "alarm";
                                } else {
                                    alarmClass = "";
                                }
                            }
                            var imgSrc = dataObj[i].image_url.si2;
                            imgSrc = (_this.isWebp && imgSrc.indexOf(".jpg") != -1) ? imgSrc + ".webp" : imgSrc;
                            htmlStr += '<li class="li_' + dataObj[i].id + '" data-id="' + dataObj[i].id + '" beginTime="' + dataObj[i].begin_time + '" expireTime="' + dataObj[i].expire_time + '" oos="' + dataObj[i].oos + ' "source_type="' + dataObj[i].source_type + '" wap_url="' + dataObj[i].wap_url + '">' + '<div class="li_bwrap">' + '<b class="' + (youpin ? "youpin" : "") + '"></b>' + '<img src="//i0.tuanimg.com/ms/zhe800m/dist/img/img_placehdv2.jpg" data-url="' + imgSrc + '" alt="' + dataObj[i].deal_image + '">' + '<div class="price_line">' + '<span class="price">' + '￥' + price + '</span> ' + '<span class="' + desClass + '">' + typeTxt + '</span>' + '<del>' + '￥' + list_price + '</del>' + '</div>' + '<div class="item">' + '<span>' + title + '</span>' + '</div>' + '<div class="buttons ' + (alarmClass == "" ? '" data-alarm="set_alarm"' : 'alarm" data-alarm="cancel_alarm"') + '>' + cancelHtml + setHtml + '</div>' + '</div>' + '</li>';
                        }
                        if (pageInd == 1) {
                            currTablist.find(".wrap_content").html("");
                        }
                        currTablist.find(".wrap_content").append('<ul class="brand_list">' + htmlStr + '</ul>');
                        if (pageInd == 1) {
                            currTablist.find(".loading_more").css("padding", "0px");
                        }
                        _this.$slideImg.height() == 0 ? $(".list_all .wrap_content").css('margin-top', '42.5px') : $(".list_all.wrap_content").css('margin-top', '0px');
                        var uls = currTablist.find(".brand_list");

                        uls.imglazyload({
                            "imgattr": "data-url"
                        });

                        var curr_ul_indx = uls.length - 1;
                        var curr_ul = uls.eq(curr_ul_indx);
                        _this.$button = curr_ul.find(".buttons");

                        exposure.exposure_ev(uls, "li", track_data);
                        if (page_from == "m") {
                            var layer_opcity = $(".layer_opcity");
                            var animate_dom = $(".animate");
                            /* $(".relative").height(document.body.offsetHeight+'px');
                       $(".layer_opcity").height(document.body.offsetHeight+'px');*/

                        }
                        _this.bindTouchEvent2(_this.$button, function(obj) {
                            var data_id = obj.parents("li").attr("data-id");
                            var data_begintime = obj.parents("li").attr("begintime");
                            var data_expiretime = obj.parents("li").attr("expiretime");
                            var data_oos = obj.parents("li").attr("oos");
                            var data_alarm = obj.attr("data-alarm");
                            /* $.tracklog.action("forcast", {
                    "dealid": data_id
                 })*/
                            if (page_from == "zheclient") {
                                _this.setalarm(obj, data_alarm, data_id, data_begintime, data_expiretime, data_oos);
                            } else {
                                //开卖提醒0像素打点
                                $.tracklog.action("seton", track_data, '{eventvalue:' + data_id + '}');
                                //样式的修改

                                $(".layer").show() && animate_dom.show() && layer_opcity.animate({
                                    "opacity": '0.5'
                                }, 'show', "fast") && setTimeout(function() {
                                    animate_dom.animate({
                                        "bottom": '0'
                                    }, 'fast');
                                }, 500);

                                //点击阴影关闭
                                layer_opcity.unbind();
                                _this.bindTouchEvent(layer_opcity, function(obj) {
                                    $(".layer").hide() && layer_opcity.css("opacity", '0') && animate_dom.css("bottom", '-270px');
                                })
                                //点击关闭按钮
                                $(".close").unbind();
                                _this.bindTouchEvent($(".close"), function(obj) {
                                    $(".layer").hide() && layer_opcity.css("opacity", '0') && animate_dom.css("bottom", '-270px');
                                })
                                //前往app设置开卖提醒的按钮
                                $(".goto_alarm").unbind();
                                _this.bindTouchEvent($(".goto_alarm"), function(obj) {
                                    bigData.setChart();
                                    $.tracklog.action("download")
                                    _this.goToHome();
                                })
                            }
                        });

                        _this.bindTouchEvent(curr_ul.find("li"), function(obj) {
                            $.cookie.set("__alarm_status", '{"status":"0","dealid":"' + obj.attr("data-id") + '"}');
                            _this.gotoClient(obj);

                        })

                    } else {
                        if (pageInd == 1) {
                            if (!($(".list_" + urlName).find(".noData") && $(".list_" + urlName).find(".noData").length)) {
                                $('<p class="noData" style="height:100px">暂无符合条件的数据</p>').appendTo($(".list_" + urlName))
                            } else {
                                $(".list_" + urlName).find(".noData").show();
                            }
                            $(".list_" + urlName).find(".bottom-pic,.loading_more").hide();
                        }
                    }
                    var temp_height = _this.$navWrap.height();
                    swi_height = document.documentElement.clientHeight;
                    $('.opcity').css('height', swi_height);
                    setTimeout(function() {
                        var list_height = $(".list_" + urlName).height();
                        var imgList_height = $(".imgList").height();
                        if (urlName == "all") {
                            if (list_height + imgList_height <= swi_height - temp_height) {
                                list_height = swi_height - temp_height - imgList_height;
                            }
                        } else {
                            if (list_height <= swi_height - temp_height) {
                                list_height = swi_height - temp_height;
                            }
                        }


                        $(".list_" + urlName).attr("data-height", list_height);
                        _this.$swipeWrap.height(list_height + "px");

                    }, 500);
                    if (typeof callback == "function") {
                        callback();
                    }
                },

                timeout: 20000,
                error: function() {
                    $(".list_" + urlName).find(".loading_more").html("加载失败，点击重新加载");
                    $(".list_" + urlName).find(".loading_more").unbind();
                    _this.bindTouchEvent($(".list_" + urlName).find(".loading_more"), function() {
                        $(".loading_more").html('<span class="loading"><i class="icon_load"></i>加载中......</span>');
                        _this.listInit(urlName, pageInd);
                    });
                }
            })

        },
        setalarm: function(obj, cmd, id, begin_time, expire_time, oos) {
            var _this = this;
            var param = {
                "cmd": cmd,
                "id": id,
                "begin_time": begin_time,
                "expire_time": expire_time,
                "oos": oos
            };
            sendnative_data.pos_value = "focst_" + foreshow.config.curName;
            sendnative_data.model_item_index = obj.parents(".wrap_content").find(".buttons").index(obj) + 1;
            sendnative_data.model_id = id;
            $.common.set_alarm(param, "$.calljs.set_alarmcallback");
            $.calljs.set_alarmcallback = function(data) {

                if (data == 0) {
                    $.common.toast({
                        "text": "设置失败"
                    })
                }
                if (data == 1) {
                    sendnative_data.model_name = "setoff";
                    if (obj.attr("data-alarm") == "cancel_alarm") {
                        $(".li_" + id).find(".buttons").attr("data-alarm", "set_alarm");
                        $(".li_" + id).find(".buttons").removeClass("alarm");
                        $.common.toast({
                            "text": "取消提醒成功"
                        });
                    } else {
                        sendnative_data.model_name = "seton";
                        $(".li_" + id).find(".buttons").attr("data-alarm", "cancel_alarm");
                        $(".li_" + id).find(".buttons").addClass("alarm");
                        $.common.toast({
                            "text": "设置成功，开抢前五分钟提醒你"
                        });
                    }
                }
                if (data == 2) {
                    $.common.toast({
                        "text": "该商品已设置开卖提醒"
                    });
                }
                $.common.get_alarmdealdata({
                    "num": "100"
                }, "$.calljs.get_alarmdealdata");
                $.tracklog.sendNative(sendnative_data);
            }
        },
        showFloat: function(hasApp) {
            var utm_csr = $.cookie.get("utm_csr");
            if (utm_csr != 'null' && utm_csr != 'direct') {
                $.ajax({
                    type: "GET",
                    url: "/m/supernatant?utm_source=" + $.cookie.get("utm_csr"),
                    success: function(data) {
                        _this.download(1, hasApp);
                    }
                });
            } else {
                $.ajax({
                    type: "GET",
                    url: "/m/supernatant?utm_source=" + $.cookie.get("utm_csr"),
                    success: function(data) {
                        _this.download(0, hasApp);
                        console.log(data);
                    }
                });
            }
        },
        goToHome: function() {

            var _this = this;
            var t1 = new Date().getTime();
            //调起客户端
            var iframe = document.getElementById('#openApp');
            if (iframe) {
                iframe.src = 'zhe800://goto_home';
            } else {
                iframe = document.createElement('iframe');
                iframe.id = 'openApp';
                iframe.src = 'zhe800://goto_home';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            //当调起app时候js进入后台调起运行，有个阻塞的过程，阻塞的时间是600-900ms(依照淘宝的)
            timeout = setTimeout(function() {
                _this.try_to_open_app(t1);
            }, 1000);
        },
        try_to_open_app: function(t1) {
            var _this = this;
            var hasApp = true;
            var t2 = new Date().getTime();
            //可以下载1025
            if (!t1 || t2 - t1 < 1000 + 200) {
                hasApp = false;
                _this.showFloat(hasApp);
            } else {
                _this.showFloat(hasApp);
            }
        },
        download: function(url_type, hasApp) {
            var utm_csr = $.cookie.get("utm_csr");
            if (utm_csr != null) {
                if (utm_csr.indexOf("_") > -1) {
                    var idx = utm_csr.indexOf("_");
                    utm_csr = utm_csr.substring(idx + 1);
                }
            } else {
                utm_csr = "";
            }

            if (hasApp) {
                console.log("安装了这个app");
            } else {
                if ($.os.ios) {

                    var down_url = "http://w.tuan800.com/dl/app/recommend/redirect?from=guanwang&app=tao800&url=itunes.apple.com/cn/app/tao800-jing-xuan-du-jia-you-hui/id502804922?mt=8";

                } else {
                    if (url_type == 1) {

                        var down_url = "//m.zhe800.com/download/bd/?bd=" + utm_csr;
                    } else {
                        var down_url = "http://d.tuan800.com/dl/Zhe800_wap.apk";
                    }
                }
                window.location.href = down_url;
            }

        },
        //获取客户端支持的所有方法
        gotoClient: function(obj) {
            var $this = obj,
                url = $this.attr("wap_url"),
                data_id = $this.attr("data-id"),
                source_type = $this.attr("source_type");
            track_data.cType = "38";
            // if (wph_from == "zheclient") {
            track_data.cId = _this.config.curName;
            track_data.dealId = data_id;
            var track_data_str = $.tracklog.trackOutstr(track_data);
            //页面流转统计
            sendnative_data.pos_value = "focst_" + foreshow.config.curName;
            sendnative_data.model_item_index = $this.parent().parent().find("li").index($this) + 1;
            sendnative_data.model_id = data_id;
            if (page_from == "zheclient") {
                if (foreshow.allmethod && foreshow.allmethod.to_detail) {
                    if (source_type == "1") {
                        var out_url = wph.out_url + "id=" + data_id + "&jump_source=2" + "&" + track_data_str;
                    }
                    if (source_type == "0") {
                        var out_url = $.zheui.protocol + "//out.zhe800.com/m/deal/" + data_id + "?" + "&" + track_data_str;
                    }
                    $.tracklog.sendNative(sendnative_data);
                    var param = {
                        "id": data_id,
                        "source_type": source_type,
                        "out_url": out_url
                    };
                    $.common.to_detail(param);
                } else {
                    if (source_type == "1") {
                        var __imgurl = "//analysis.tuanimg.com/v1/global/img/b.gif?temp=youph&" + track_data_str + "&" + Math.random();
                        $(".ga_img").remove();
                        $("body").append("<img src='" + __imgurl + "' class='ga_img hide'>");
                        window.location.href = "zhe800://special_deal?dealid=" + data_id;
                    }
                    if (source_type == "0") {
                        //淘宝，天猫
                        var to_url = url + "?" + track_data_str;
                        var params = {
                            "title": "商品详情",
                            "url": to_url
                        };
                        $.common.loadpage(params);
                    }
                }
            }
            if (page_from == "m") {
                track_data.cType = "50";
                var track_data_str = $.tracklog.trackOutstr(track_data);
                console.log(track_data_str);
                if (source_type == "1") {
                    //商城
                    //alert(wph.out_url+"url=" + encodeURIComponent(to_url)+ "&" + track_data_str);
                    var to_url = wph.m_url + "?id=" + data_id;
                    to_url = wph.out_url + "url=" + encodeURIComponent(to_url) + "&" + track_data_str;
                    window.location.href = to_url;
                }
                if (source_type == "0") {
                    //淘宝，天猫
                    console.log(url)
                    window.location.href = url + "?" + track_data_str;
                }
            }

        },
        gototop: function() {
            $(window).scroll(function() {
                if (document.body.scrollTop > 550) {
                    $(".top_con").animate({
                        display: 'block'
                    }, 10000);
                } else {
                    $(".top_con").animate({
                        display: 'none'
                    }, 10000);
                }
            });
            this.bindTouchEvent($(".top_con"), function() {
                document.body.scrollTop = 0;
                // $("html,body").animate({scrollTop:"0px"},500);

            })
        }
    }
    //当用户后台关闭通知选项ios支持手动仅一次设置开卖提醒
    $.calljs.setAlarm = function(o) {
        $(".li_" + o).find(".buttons").attr("data-alarm", "set_alarm");
        $(".li_" + o).find(".buttons").removeClass("alarm");
        $.common.toast({
            "text": "取消提醒成功"
        });
    };
    foreshow.init();

});