/**
 * zhe800首页专用js
 * modify by zhoushanbao by 2016.03.09
 */
define(function(require, exports, module) {
    var $ = require("zepto");
    require('../common/base');
    var Swipe = require("../common/swipe");
    require("../common/imglazyload");
    var track = require("../common/track_v2");
    //初始化htt-header
    track.init("M");
    //添加pos_type和pos_value
    var track_data = {
      pos_value:"home",
      pos_type:"home",

    };
    //将track_data写入cookie
    $.tracklog.addCokkie(track_data);
    var base64 = require('../common/base64');
    var base64str = new base64();
    var gotop = require("../common/gotop");
    var dialog = require('../common/dialog');
    var bigData = require('../common/bd');
    var showFloat = require('../common/show_float');
    // var iScroll = require("../common/iscroll5");
        var iScroll = require("../common/iscroll");
    iScroll = window.IScroll || window.iScroll || iScroll;
    var mydialog = new dialog();
    var is_login = false; //用户登录状态
    gotop.init();

    //引入曝光统计
    var exposure = require("../common/exposure");
    //新老用户标示，0：新用户，1：老用户
    var user_type = 0;
    if ($.cookie.get("user_type") == null) {
        $.cookie.set("user_type", "1");
        user_type = 0;
    } else {
        user_type = $.cookie.get("user_type");
    }
    //获取用户身份
    var user_role = $.cookie.get("user_role") || "";
    var isStudent = $.cookie.get("student") || "";

    var HomePage = {
        // var ele = 
        isPaid: 0,
        platform: 'iPhone',
        isWebp: false,//检查浏览器是否符合webp
        // 搜索，废弃方法
        getAmount: function() {
            $.ajax({
                type: "GET",
                url: "/v2/deals/count/zaojiuwanba",
                success: function(data) {
                    $('#D_whole_summary').text(data.now_count);
                    $('#search_input').attr("placeholder", "在" + data.now_count + "款商品中搜索");
                },
                timeout: 20000,
                error: function() {
                    console.log("connecting error");
                }
            });
        },
        //安卓下的百度浏览器的商品列表点击bug
        isBaidu: function() {
            var zhe_list_li = $(".list_W .list").find("li");
            $.zheui.bindTouchGoto(zhe_list_li, function(obj) {
                var url_id = obj.attr("data-url");
                var dealId = obj.attr("data-id");
                if (url_id.length > 0) {
                    window.location.href = url_id;
                }
            });
        },
        //获取推荐类别,已废弃
        getCategory: function() {
            var category = $(".category");
            $.ajax({
                type: "GET",
                url: "/v4/tags/recommend?user_type=" + user_type + "&user_role=" + user_role + "&student=" + isStudent,
                success: function(data) {
                    if (typeof data == "object" && data.length) {
                        // console.log("get category data", data);
                        var htmlstr = '';
                        for (var i = 0; i < 7; i++) {
                            var imgPath = 'http://i0.tuanimg.com/ms/zhe800m/dist/img/cate/'+data[i].url_name+'.jpg';
                            htmlstr += '<li id="' + data[i].id + '" class="' + data[i].url_name + '_o" data-url="/m/list/' + data[i].url_name + '?url_name=' + data[i].url_name + '&category_name=' + data[i].category_name + '"><span><img src="' + imgPath + '" width="50" height="50"></span><strong>' + data[i].category_name + '</strong></li>';
                        }
                        htmlstr += '<li class="all_o" data-url="/m/category/category"><span></span><strong>更多</strong></li>';
                        category.html(htmlstr);
                        $.zheui.bindTouchGoto($(".category").find("li"), function(obj, i) {
                            var _this = obj;
                            window.location.href = _this.attr("data-url");

                            //统计
                            //var num = 4 + (i + 1);
                            //var t_obj = {
                            //    "d": num
                            //};
                            //if (_this.attr("id")) {
                            //    t_obj.c = _this.attr("id");
                            //}
                            //$.tracklog.action("ic", t_obj);
                            if((i+1) != 8){
                                $.tracklog.action("ic",track_data, '{eventvalue:'+_this.attr("class").split("_")[0]+',eventindex:'+(i+1)+'}');
                            }else{
                                $.tracklog.action("ic",track_data, '{eventvalue:more,eventindex:'+(i+1)+'}');
                            }
                        });

                    } else {
                        category.find(".loading").text("数据加载失败，请稍后再试");
                    }
                },
                timeout: 20000,
                error: function() {
                    console.log("网络异常");
                    // category.find(".loading").text("数据加载失败，请稍后再试");
                }
            });
        },
        //获取分类列表
        getNav: function(){
            var _this = this;
            var cateData = JSON.parse($.localData.get('category_data'));
            if(cateData){
                _this.renderNav(cateData);
            }
            else{
                $.ajax({
                    type: 'GET',
                    url: "/m/tags/v2?user_type=" + user_type + "&user_role=" + user_role + "&vt=" + new Date().getTime(),
                    dataType:"json",
                    success: function(data){ 
                        $.localData.set('category_data', JSON.stringify(data));
                        console.log('getNav,data:', data);
                        _this.renderNav(data);
                        
                    },
                    timeout: 20000,
                    error: function() {
                         console.log("网络异常");
                    }
                });  
            }
            
        },

        renderNav: function(data){
            var _this = this;
            var navWrap = $('#navWrap');
            var subnavlist = $('.subnavlist');
            var navWrapdown = $('.sels_down ul');
            if (!(data && data.length)) {
                navWrap.hide();
                return;
            } else {
                navWrap.show();
                navWrap.find(".icon").show();
            }
            var navData = data;
            var navHtml = '';
            var navdownHtml = '';

            navData.forEach(function(item, index){
                if(item.level == 1){
                    navHtml +='<span class="navItem" url-name="'+ item.url_name +'">'+item.category_name+'<i></i></span>';
                    navdownHtml +='<li class="navdownItem" url-name="'+ item.url_name +'">'+ item.category_name +'<span></span></li>';
                }
            });
            navdownHtml += '<li class="moreCategory"><span>更多分类<i></i></span></li>';
            subnavlist.append(navHtml);
            navWrapdown.append(navdownHtml);

            var navList = subnavlist.find("span");
            var navlist_down = navWrapdown.find("li");
            $('.navItem.index').addClass("selected");
            navlist_down.eq(0).addClass("selected").siblings().removeClass("selected");
            document.body.scrollTop = 0;
            //上划时tab栏吸顶
            var topBar = $('.topbar');
            $(window).bind('scroll', function(){
                if($('body')[0].scrollTop >　topBar.height() + topBar.offset().top){
                    $('#navWrap').css('position','fixed');
                   $('#navWrap').css('top',0); 
                }
                else{
                    $('#navWrap').css('position','relative');
                    $('#navWrap').css('top',0); 
                }
            });
            _this.navScroll();
            _this.navupdown();
            _this.tabFn();
        },
        /*
       导向横向滑动
      */
        navScroll: function() {
            var scrollWidth = 0,
                _this = this,
                subnavlist = $('.subnavlist'),
                navList = $('.subnavlist span');
            navList.forEach(function(item) {
                $(item).attr("data-left", scrollWidth);
                scrollWidth += $(item).width();
            });
            scrollWidth += 10;
            subnavlist.width(scrollWidth);
            this.scrollObj = new iScroll(jcy_navList, {
                snap: false,
                momentum: false,
                hScrollbar: false,
                hScroll: true,
                onScrollEnd: function() {}
            });
        },
        /*
       下拉的属性
      */
        navupdown: function() {
            var _this = this;
            var navupdown = $('#navWrap').find(".icon");
            var navWrapdown = $(".sels_down ul");
            var subnavlist = $('.subnavlist');
            navupdown.addClass("navdown");
            var subNavHeight = $(".sels_down ul").height();
            //点击背景收起下拉栏
            this.bindTouchEvent($(".opcity"), function() {
                $('#navWrap .index.navItem').css('display','block');
                $('#navWrap .line').css('display','block');
                $('#navWrap .navdownShow').css('display','none');
                subnavlist.css('display', 'block');
                $(".opcity").css("display", "none");
                $("#ct").css("height", "auto");
                var nav_height = _this.up_flag ? $('#navWrap').height(): (-1) * subNavHeight;
                _this.up_flag = !_this.up_flag;
                navWrapdown.animate({
                    top: (-1) * (subNavHeight + navWrapdown.offset().top)
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

            //点击下拉按钮显示下拉栏
            this.bindTouchEvent($(".navdown"), function() {
                var nav_height = _this.up_flag ? $('#navWrap').height() : (-1) * (subNavHeight + navWrapdown.offset().top);
                _this.up_flag = !_this.up_flag;
                navWrapdown.animate({
                    top: nav_height
                }, 200);
                if (nav_height == $('#navWrap').height()) {
                    $('#navWrap .index.navItem').css('display','none');
                    $('#navWrap .line.left').css('display','none');
                    $('#navWrap .navdownShow').css('display','block');
                    subnavlist.css('display', 'none');
                    $(".sels_down").css("display", "block");
                    $(".opcity").css("display", "block");
                    swi_height = document.documentElement.clientHeight + 'px';
                    // $("#ct").css("height", swi_height);
                    $(".icon_down").animate({
                        "-webkit-transform": 'rotateZ(-180deg)',
                        "transition": "all 0.2s ease-in-out"
                    }, 'fast')
                } else {
                    $('#navWrap .index.navItem').css('display','block');
                    $('#navWrap .line.left').css('display','block');
                    $('#navWrap .navdownShow').css('display','none');
                    subnavlist.css('display', 'block');
                    $(".opcity").css("display", "none");
                    // $("#ct").css("height", "auto");
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
        //点击分类栏跳转其他页面
        tabFn: function(){
            var _this = this;
            var navList = $('.subnavlist span');
            var navlist_down = $('.sels_down li');
            var moreCategory = $('.sels_down .moreCategory');
            var indexItem = $('.navItem.index');
            var indexDownItem = $('.navdownItem.index');

            //点击上方分类跳转
            this.bindTouchEvent(navList, function(t){
                var urlName = t[0].getAttribute('url-name');
                var categoryName = t[0].innerText;
                window.location.href = 'm/catelist/'+urlName+'?url_name='+urlName+'&category_name='+encodeURI(categoryName);
            });

            //点击下拉列表跳转
            this.bindTouchEvent(navlist_down, function(t){
                var urlName = t[0].getAttribute('url-name');
                var categoryName = t[0].innerText;
                window.location.href = 'm/catelist/'+urlName+'?url_name='+urlName+'&category_name='+encodeURI(categoryName); 
            });

            //点击更多分类跳转分类页
            this.bindTouchEvent(moreCategory, function(t){
                window.location.href = 'm/category/category';
            });

            //点击推荐跳转首页
            this.bindTouchEvent(indexItem, function(){
                window.location.href  = '/';
            }); 

            //点击下拉列表推荐跳转首页
            this.bindTouchEvent(indexDownItem, function(){
                window.location.href  = '/';
            }); 
        },
        seleRole: function() {
            var htmlStr = '';
            var roleVal = "";
            htmlStr += '<span class="role-title">身份选择</span>' +
                '<i></i>' +
                '<div class="user-role-selec">' +
                '<span>选择身份，只为给你私人定制更合适的商品</span>' +
                '<div class="select-area">' +
                '<div class="select-item boy" user_role="1"><div></div></div>' +
                '<div class="select-item girl" style="margin:0 15px;" user_role="4"> <div></div></div>' +
                '<div class="select-item mother" user_role="6"><div ></div></div>' +
                '<div class="student"><div></div></div>' +
                '</div>' +
                '<div class="btn-area" >' +
                '<span class="btn-cancel">取&nbsp;消</span>' +
                '<span class="btn-sure">确&nbsp;认</span>' +
                '</div>' +
                '</div>';
            //创建浮层

            mydialog.create("2", htmlStr);

            //身份选择初始化
            if (user_role) {
                if (user_role == "6") {
                    $(".mother").find("div").addClass("on").siblings(".select_item").removeClass('on');
                } else {
                    $(".student div").css("display", "inline-block");
                    if (user_role == "1") {
                        $(".boy").find("div").addClass("on").siblings(".select_item").removeClass('on');
                    } else if (user_role == "4") {
                        $(".girl").find("div").addClass("on").siblings(".select_item").removeClass('on');
                    }
                }
            }
            if (isStudent) {
                if (isStudent == 1) {
                    $(".student div").addClass("on");
                };
            }

            $.zheui.bindTouchGoto($(".select-item"), function(obj) {
                var _this = obj;
                roleVal = _this.attr('user_role');
                _this.find("div").addClass('on');
                _this.siblings(".select-item").find("div").removeClass('on');
                if (roleVal == "1" || roleVal == "4") {
                    $(".student div").css("display", "inline-block");
                } else if (roleVal == "6") {
                    $(".student div").removeClass('on');
                    $(".student div").css("display", "none");
                }
            });
            $.zheui.bindTouchGoto($(".student"), function(obj) {
                var _this = obj;
                _this.find("div").toggleClass('on');
            });
            $.zheui.bindTouchGoto($(".btn-cancel"), function() {
                mydialog.hide();
            });
            $.zheui.bindTouchGoto($(".btn-sure"), function() {
                $.cookie.set("user_role", roleVal);
                if ($(".student").find("div").hasClass("on")) {
                    $.cookie.set("student", "1");
                } else {
                    $.cookie.set("student", "0");
                }
                //统计
                //$.tracklog.action("model", {
                //    "t": roleVal
                //});
                // HomePage.getCategory();
                mydialog.hide();
            });
            // 控制高度
            setTimeout(function() {
                var wh = window.innerHeight;
                var max = Math.max(wh, document.body.clientHeight);
                $(".bg_layer").css("height", max + "px");
            }, 1000);
        },
        getUserAgent: function(){
            if(navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1){
                this.platform = 'Android';
            }
            else{
                this.platform = 'iPhone';
            }
        },
        getBanner: function() {
            var slideimg = $(".slide_img");
            var that = this;
            var data = {};
            var role = 1;
            //为没有身份的用户设置默认身份
            if(user_role != '0'){
                role = user_role;
            }
            if(isStudent != ''){
                data = {
                    show_location: '1',
                    user_type: user_type,
                    user_role: role,
                    image_model: this.isWebp ? 'webp' : 'jpg',
                    student: isStudent,
                    support_point: '17',
                    paid: this.isPaid,
                    platform: this.platform
                };
            }
            else{
                data = {
                    show_location: '1',
                    user_type: user_type,
                    user_role: role,
                    image_model: this.isWebp ? 'webp' : 'jpg',
                    support_point: '17',
                    paid: this.isPaid,
                    platform: this.platform
                };
            }
            $.ajax({
                type: "GET",
                // url: "/msite/banner",
                url: "//m.api.zhe800.com/operation/banner/v1",
                data: data,
                dataType: 'jsonp',
                success: function(data) {
                    if (typeof data == "object" && data.length) {
                        var htmlstr = '<ul>';
                        var htmlstr2 = '<div class="img_indx">';
                        //需要屏蔽的url数组
                        var urlNotShow = ['http://th5.m.zhe800.com/activity/xianshi?pub_page_from=zheclient','http://hd.zhe800.com/j/cn/control/one/activity/list#home','http://hd.zhe800.com/j/control/one/activity/list#home','http://g.hd.zhe800.com/grabcoupon/index','http://m.zhe800.com/h5/cn/hongbao/invite_page','http://live.m.zhe800.com'];
                        //需要显示的url的数目
                        var urlShowNum = 0;
                        for (var i = 0; i < data.length; i++) {
                            if(/^((https|http)?:\/\/)((?!pina).)+/.test(data[i].data) && !(/.*(live.m.zhe800.com).*/.test(data[i].data)) && data[i].point == '17'){
                                var result = urlNotShow.every(function(item){
                                    return (item != data[i].data);
                                });
                                if(result){
                                    urlShowNum ++;
                                    var urlReplace = data[i].data;
                                    //对大促页面进行过滤，去除桥页面
                                    if(/^((https|http)?:\/\/hd.zhe800.com\/xindacu\/app\/).+/.test(urlReplace)){
                                        urlReplace = urlReplace.replace('app','m');
                                    }
                                    if(that.platform == 'Android'){
                                        htmlstr += '<li bannerid="' + data[i].id + '"><a href="' + urlReplace + '"><img src="' + data[i].android_pic + '"  alt="' + data[i].title + '"></a></li>';
                                        htmlstr2 += '<span></span>';
                                    }
                                    else{
                                        htmlstr += '<li bannerid="' + data[i].id + '"><a href="' + urlReplace + '"><img src="' + data[i].ios_pic + '"  alt="' + data[i].title + '"></a></li>';
                                        htmlstr2 += '<span></span>';
                                    }
                                }
                            }
                        }
                        htmlstr += '</ul>';
                        htmlstr2 += '</div>';
                        slideimg.html(htmlstr);
                        slideimg.append(htmlstr2);
                        $(".img_indx span").eq(0).addClass("curr");
                        //绑定滑动事件
                        var slide_img = document.querySelector('.slide_img');
                        var img_indx = $(".img_indx span");

                        // 轮播数量只有一个时不进行轮播
                        img_indx.length > 1 && Swipe(slide_img, {
                            startSlide: 0,
                            speed: 400,
                            auto: 2000,
                            continuous: true,
                            disableScroll: false,
                            stopPropagation: true,
                            callback: function (index, ele) {
                                //console.log(index);
                                //console.log(ele);
                            },
                            transitionEnd: function (index, element) {
                                // 由于轮播banner少于两个时，为了保证循环，会复制额外的两个banner辅助循环，所以需要在计算当前选中项时进行处理。
                                img_indx.eq(img_indx.length > 2 ? index : (index % 2)).addClass("curr").siblings().removeClass("curr");
                            }
                        });

                        //大图点击功能封装
                        function img_touch_init(arr, gotofun) {
                            var x_ismove;
                            arr.each(function(index, ele) {
                                $(ele).bind("touchstart", function(e) {
                                    x_ismove = false;
                                }).bind("touchmove", function(e) {
                                    x_ismove = true;
                                }).bind("touchend", function(e) {
                                    if (x_ismove) {
                                        return;
                                    }
                                    if (typeof gotofun == "function") {
                                        gotofun($(this), index);
                                    }
                                });
                            });
                        }
                        img_touch_init($(".slide_img li"), img_touch);

                        function img_touch(_this, i) {
                            var bannerid = _this.attr("bannerid");
                            var index = i + 1;
                            $.tracklog.action("b", track_data,'{eventvalue:'+ bannerid+',eventindex:'+ index +'}');
                        }
                        //如果需要显示的banner数量为0，隐藏banner
                        if(urlShowNum == 0){
                            slideimg.hide();
                        }
                    } else {
                        slideimg.hide();
                    }
                },
                timeout: 20000,
                error: function() {
                    console.log("网络异常");
                    // slideimg.find(".loading").text("数据加载失败，请稍后再试");
                }
            });
        },
        getToday: function() {
            var hot_recommend = $(".hot_recommend");  
            //默认跳转地址
            var urlarr = [     
                "/m/list/all?url_name=all&category_name=今日更新&time=today",
                "/m/day10/day10",
                "/m/forecast/forecastv2?pub_page_from=m",
                "/m/list/mobile?url_name=mobile&category_name=手机周边",
                "/m/list/baoyou?url_name=baoyou&category_name=9块9包邮"
            ];
            var url;
            $.ajax({
                type: "GET",
                // 老接口/homesetting/v5，新接口/m/homesetting
                url: "/m/homesetting?image_model=jpg",
                //url: "/homesetting/v5?image_model=jpg",
                success: function(data) {
                    if (typeof data == "object" && data.length) {
                        /*今日更新、每日十件、精选预告、iphone周边/手机周边、9块9包邮、品牌团、值得逛、优品汇、特卖商城-----展示---start*/
                       var htmlstr = '';
                        //console.log("data["+i+"].url="+data[i].url);
                        if (data[0].point == "1") {

                            urlarr[0] = data[0].url;
                        }
                        $(".today").data("url", urlarr[0]);
                        $(".tit.t1").text(data[0].title);
                        htmlstr += '<dd class="txt">' + data[0].content + '</dd><dd class="img"><img src="' + data[0].pic + '" width="108" height="108" alt=""><span></span></dd></dl>';
                        $(".today").append(htmlstr);

                        var rec_item = $(".hot_recommend").find('dl');
                        for (var i = 0; i < data.length; i++) {

                            //console.log("data["+i+"].point="+data[i].point+"   "+ data.length)

                            if (data[i].point == "1") {
                                urlarr[i] = data[i].url;
                            }
                            rec_item.eq(i).data('url', urlarr[i]);
                            if(i==4){
                               // console.log("data数据展示："+data[i].title);
                                rec_item.eq(i).find('.tit').text("9块9包邮");
                            }else{
                             rec_item.eq(i).find('.tit').text(data[i].title);
                            }
                           // rec_item.eq(i).find('.tit').text(data[i].title);
                            
                            htmlstr = '<dd class="txt">' + data[i].content + '</dd><dd class="img"><img src="' + data[i].pic + '" width="45" height="45" alt=""></dd></ dl>';
                            rec_item.eq(i).append(htmlstr);
                        }
                       /*今日更新、每日十件、精选预告、iphone周边/手机周边、9块9包邮、品牌团、值得逛、优品汇、特卖商城-----展示---end*/


                       /*根据手机型号来展示具体显示，如果为iphone手机，则显示iphone周边，否则显示手机周边------start*/
                        var agentInfo = navigator.userAgent,ua_text;
                        if (/iphone os/gi.test(agentInfo)) {
                            ua_text = "iphone周边";
                        } else{
                            ua_text = "手机周边";
                        }
                        $($('.tit')[3]).html(ua_text);
                        /*根据手机型号来展示具体显示，如果为iphone手机，则显示iphone周边，否则显示手机周边------end*/

                          
                        /*今日更新、每日十件、精选预告、iphone周边/手机周边、9块9包邮的点击次数统计----start */
                        $.zheui.bindTouchGoto($(".hot_recommend").find('dl'), function(obj, i) {

                            var _this = obj;
                            //统计
                            //var t_obj = {};
                            //switch (i) {
                            //    case 0:
                            //        t_obj.d = "4";
                            //        break;
                            //    case 1:
                            //        t_obj.d = "9";
                            //        break;
                            //    case 2:
                            //        t_obj.d = "1";
                            //        break;
                            //    case 3:
                            //        t_obj.d = "2";
                            //        break;
                            //    case 4:
                            //        t_obj.d = "3";
                            //        break;
                            //
                            //}
                            //var index = i+1;
                            //$.tracklog.action("ic",'', '{eventvalue:}');
                            switch (i){
                                case 0:
                                    $.tracklog.action("operation",track_data, '{eventvalue:today,eventindex:0}');
                                    break;
                                case 1:
                                    $.tracklog.action("operation",track_data, '{eventvalue:ten,eventindex:0}');
                                    break;
                                case 2:
                                    $.tracklog.action("operation",track_data, '{eventvalue:forcast,eventindex:0}');
                                    break;
                                case 3:
                                    $.tracklog.action("operation",track_data, '{eventvalue:phone,eventindex:0}');
                                    break;
                                case 4:
                                    $.tracklog.action("operation",track_data, '{eventvalue:baoyou,eventindex:0}');
                                    break;
                            }
                            window.location.href = _this.attr("data-url");
                        });
                         /*今日更新、每日十件、精选预告、iphone周边/手机周边、9块9包邮的点击次数统计----end */


                        /*品牌团、值得逛、优品汇、特卖商城的点击次数统计----start */
                        $.zheui.bindTouchGoto($(".hot_bottom").find("dl"), function(obj, i) {
                         
                            var _this = obj;
                            window.location.href = _this.attr("data-url");
                            //统计
                            //var t_obj = {};
                            //switch (i) {
                            //    case 5:
                            //        t_obj.m = "1";
                            //        break;
                            //    case 6:
                            //        t_obj.m = "2";
                            //        break;
                            //}
                            //$.tracklog.action("ic", t_obj);
                            switch (i){
                                case 0:
                                    $.tracklog.action("operation",track_data, '{eventvalue:brand,eventindex:0}');
                                    break;
                                case 1:
                                    $.tracklog.action("operation",track_data, '{eventvalue:guang,eventindex:0}');
                                    break;
                                case 2:
                                    $.tracklog.action("operation",track_data, '{eventvalue:youph,eventindex:0}');
                                    break;
                                case 3:
                                    $.tracklog.action("operation",track_data, '{eventvalue:store,eventindex:0}');
                                    break;
                            }
                        });
                      /*品牌团、值得逛、优品汇、特卖商城的点击次数统计----end */

                    } else {
                        console.log("数据加载失败，请稍后再试");
                    }
                },
                timeout: 20000,
                error: function() {
                    console.log("网络异常");
                }
            });
        },
        getUserStatus: function() {
            var that = this;
            $.ajax({
                type: "GET",
                // url: "//th5.m.zhe800.com/api/auth/islogin?callback=?&n=" + Math.random(),
                url: "https://passport.zhe800.com/j/h5/auth/islogin?callback=?" + "&n=" + Math.random(),
                // url: "//th5hsm.zhe800.com/api/auth/islogin?callback=?&n=" + Math.random(),
                dataType: "jsonp",
                success: function(data) {
                    if (typeof data == "object") {
                        is_login = data.islogin;
                        if (is_login) {
                            $(".footer .out").show();
                            $(".footer .in").hide();
                            $(".list_W .list_summary").find(".fl").text("您的专属推荐");
                            $(".list_W .list_summary").find(".fr").hide();
                            getuserInfo();
                            that.isNewCustomer();
                        } else {
                            $(".footer .in").show();
                            $(".footer .out").hide();
                            $(".list_W .list_summary").find(".fr").show();
                            $(".list_W .list_summary").find(".fl").text("精选推荐");
                            //登录
                            $.zheui.bindTouchGoto($(".btn_login"), function(obj) {
                                var url = encodeURIComponent(window.location.href);
                                window.location.href = "//m.zhe800.com/login?return_to=" + url;
                            });
                            that.getBanner();
                        }
                    }
                }
            });
        },
        isNewCustomer:function(){
            var that = this;
            $.ajax({
                type: "GET",
                url: "/m/novice",
                dataType: "jsonp",
                success: function(data) {
                    if (typeof data == "object") {
                         // console.log("ddsd",data);
                         if(data.isNovice==true){           
                            that.getNewCustomer();
                            that.isPaid = 0;
                         }else{
                            that.isPaid = 1;
                         }
                         that.getBanner();
                    }
                }
            });
        },
        getNewCustomer:function(){
                $.ajax({
                    type: "GET",
                    url: "/m/home/model4/banner",
                    success: function(data) {
                        var ele = $(".newUserShow");
                        // console.log("data:", data);
                        if (typeof data == "object" && data.length) {
                           var html='';
                            for (var i = 0; i < data.length; i++) {
                               if(i==0){
                                html+="<div class=\"jrgxItem\" data-url='"+data[i].Url+"'><span class='tit'>"+data[i].Title+"</span><p class='img'><img src='"+data[i].Pic+"'/></p></div>";

                               }else if(i==1){
                                html+="<div class=\"jxygItem\" data-url='"+data[i].Url+"'><span class='tit'>"+data[i].Title+"</span><p class='img'><img src='"+data[i].Pic+"'/></p></div>";
         
                               }else if(i==2){
                                html+="<div class=\"zdgItem\" data-url='"+data[i].Url+"'><span class='tit'>"+data[i].Title+"</span><p class='img'><img src='"+data[i].Pic+"'/></p></div>";
         
                               }else{

                               }
                            }
                            ele.append(html);
                            ele.css("display","block");

                            /*4区点击打开链接----start */
                            $.zheui.bindTouchGoto($(".newUserShow").find("div"), function(obj, i) {
                            var _this = obj;
                            window.location.href = _this.attr("data-url");
                            });
                            /*4区点击打开链接----end */
                        }
                    },
                    timeout: 20000,
                    error: function() {
                        console.log("网络异常");
                    }
                });
        },
        // 废弃
        getBrandList: function() {
            var _this = this;
            browserWidth = $('body').width();
            var url;
            $.ajax({
                type: "get",
                url: 'http://m.zhe800.com/m/brand/top',
                data: { per_page: 10, user_type: user_type, user_role: user_role, student: isStudent, image_model: this.isWebp ? 'webp' : 'jpg' },
                dataType: "jsonp",
                success: function (data) {
                    var ele = $('.brand_sale').find('ul');
                    if ($.isPlainObject(data) && Array.isArray(data.objects) && data.objects.length > 0) {
                        var s = '', list = document.querySelector('.brand_sale ul');
                        data.objects.forEach(function (brand) {
                            var dealid = '', price = '', id='';
                            if (Array.isArray(brand.deals) && $.isPlainObject(brand.deals[0])) {
                                id = (brand.id + '').replace(/>/g, '&gt;').replace(/</g, '&lt;');
                                dealid = (brand.deals[0].id + '').replace(/>/g, '&gt;').replace(/</g, '&lt;');
                                price = parseInt(brand.deals[0].price);
                                price = price >= 0 ? ('&yen' + (price / 100)) : '';
                            }
                            s += '<li><a href="' + '/m/brand/list?brand_id=' + id + '&include_deal_id=' + dealid + '"><div class="brand_img" style="background-image: url('
                                + (brand.square_image + '').replace(/\.\d+x\d+\.jpg/g, '.180x180.jpg').replace(/>/g, '&gt;').replace(/</g, '&lt;') + ')"><i class="ico_price">'
                                + price + '</i></div><div class="brand_info">'
                                + (brand.name + '').replace(/>/g, '&gt;').replace(/</g, '&lt;') + '</div></a></li>';
                        });
                        // s = s + s + s + s + s + s + s;
                        s += '<li class="more-brands"><a href="/m/brand"></a></li>';
                        list.innerHTML = s;
                        list.scroller = new iScroll(list.parentNode, {
                            scrollY: false,
                            scrollX: true,
                            snap: 'li',
                            scrollbars: false,
                            eventPassthrough: true,
                            click: true,
                            disableTouch: false
                        });
                        //跳转品牌团商品列表页
                        $brandListItems = ele.find("li");
                        $.zheui.bindTouchGoto($brandListItems, function(element,index) {
                                var brandId = element.attr("data-id");
                                var id = element.attr("id");
                                index = index + 1;
                                $.tracklog.action("brand",track_data, '{eventvalue:'+ id +',eventindex:'+index+'}');
                                window.location.href = "/m/brand/list?brand_id=" + brandId + "&include_deal_id=" + id + "";
                        });
                    } else {
                        $('.brand_sale_list').hide();
                    }
                }
            });
        },
        loadlist: function() {
            var list_W = $(".list_W");
            var list = list_W.find(".list");
            var zhe_list_li = $(".list_W .list").find("li");
            isload = true;
            if(this.isWebp){
                // modify by wangguanjia for feature_122144,deals from big data
                // old /m/index/deals?
                var url = "/m/index/recommend/deals?image_type=small&image_model=webp&page=" + pagenum + "&per_page=20&user_type=" + user_type + "&user_role=" + user_role;
            }else{
                var url = "/m/index/recommend/deals?image_type=small&image_model=jpg&page=" + pagenum + "&per_page=20&user_type=" + user_type + "&user_role=" + user_role;
            };
            $.ajax({
                type: "GET",
                url: url,
                success: function(data) {
                    isload = false;
                    if ($.os.ios) {
                        setTimeout(function() {
                            $(".bg_layer3").hide();
                        }, 300);
                    }
                    if (typeof data == "object") {
                        var __data = data.objects;
                        if (__data.length) {
                            pagenum++;
                            var has_next = data.meta.has_next;
                            var load_img = "//i0.tuanimg.com/ms/zhe800wx/dist/img/img_placehd2.png";
                            var htmlstr = '<ul>';
                            var jf_arr0 = [],
                                jf_arr1 = [],
                                jf_arr2 = [],
                                jf_arr3 = [],
                                jf_arr4 = [],
                                jf_arr5 = [];
                            for (var i = 0; i < __data.length; i++) {
                                var zhuanxiang = __data[i].zhuanxiang; //手机专享
                                var today = __data[i].today; //0：旧，1：新（new）
                                var source_type = __data[i].source_type; //商品来源：1--是商城，0--是淘宝/天猫
                                var shop_type = __data[i].shop_type; //商品类型 1天猫 0 淘宝 4特卖商城
                                var deal_type = __data[i].deal_type; 
                                var brand_product_type = __data[i].brand_product_type;
                                var baoyou = __data[i].baoyou; //包邮
                                var begin_time = __data[i].begin_time.replace("-", "/"); //开始时间
                                var list_price = __data[i].list_price / 100; // 原价
                                var price = __data[i].price / 100; //折扣价
                                var zhekou = (price / list_price * 10).toFixed(1); //折扣
                                var oos = __data[i].oos; //0代表未卖光，1代表已卖光
                                var now = new Date().valueOf();
                                var start = false;
                                var begin_time = new Date(begin_time).valueOf();
                                var brand_id = __data[i].brand_id; //品牌团id
                                if (now < begin_time) {
                                    start = true;
                                }
                                //跳转链接
                                var url = "";
                                if (source_type == 1) {
                                    url = $.tracklog.outUrl($.zheui.domain + "/m/detail/" + __data[i].id, {
                                        liststatus: 1,
                                        dealId: __data[i].id
                                    });
                                    //url = $.tracklog.outUrl($.zheui.domain + "/m/detail/detail?id=" + __data[i].id);
                                } else {
                                    //console.log(__data[i].wap_url);
                                    url = $.tracklog.outUrl(__data[i].wap_url, {
                                        liststatus: 1,
                                        dealId: __data[i].id
                                    });
                                    //url = $.tracklog.outUrl(__data[i].wap_url);
                                }

                                var baoyou_txt = "不包邮";
                                if (baoyou) {
                                    baoyou_txt = "包邮";
                                }
                                if (brand_id > 0) {
                                    //补足进入品牌团列表页参数
                                    htmlstr += '<li data-url="'+$.zheui.domain+'/m/brand/list?brand_id=' + brand_id + '&include_deal_id=' + __data[i].id + '"  data-id="' + __data[i].id + '" class="flag_out"><a href="javascript:void(0);"><div class="pro_img">';
                                } else {
                                    htmlstr += '<li data-url="' + url + '" data-id="' + __data[i].id + '" class="flag_out"><a href="javascript:void(0);"><div class="pro_img">';
                                }
                                htmlstr += '<img src="' + load_img + '" alt="' + __data[i].short_title + '"  data-url="' + __data[i].image_url.si3 + '">';
                                if (brand_id > 0) {
                                    htmlstr += '<i class="ico_type_1" ></i>';
                                } else if (deal_type > 0 && deal_type != 2) {
                                    htmlstr += '<i class="ico_type_' + __data[i].deal_type + '" ></i>';
                                } else if (deal_type == 2 && today == 0) {
                                    htmlstr += '<i ></i>';
                                } else if (today == 1) {
                                    htmlstr += '<i class="ico_new" ></i>';
                                }
                                htmlstr += '</div>';
                                htmlstr += '<div class="pro_info"><div class="tit_area">';
                                if (oos == 1) {
                                    htmlstr += '<strong class="pad10">' + __data[i].short_title + '</strong>' +
                                        '<i class="ico qiangwan"></i>';
                                } else {
                                    if (start) {
                                        htmlstr += '<strong class="pad10">' + __data[i].short_title + '</strong>' +
                                            '<i class="ico nostart"></i>';
                                    } else if (zhuanxiang) {
                                        htmlstr += '<strong class="pad42">' + __data[i].short_title + '</strong>' +
                                            '<i class="ico phone"></i>';
                                    } else if (today == 1) {
                                        htmlstr += '<strong class="pad10">' + __data[i].short_title + '</strong>';
                                    } else {
                                        htmlstr += '<strong>' + __data[i].short_title + '</strong>';
                                    }
                                }

                                htmlstr += '</div>';

                                htmlstr += '<div class="attr"><span class="price">&yen;' + price + '</span><del>&yen;' + list_price + '</del>';
                                if (source_type == 1) {
                                    if (usegrade != -1) {
                                        var jf = __data[i].scores["z" + usegrade];
                                        //htmlstr += '<span class="fr jf">+' + jf + '积分</span>';
                                    } else {
                                        for (var j = 0; j < 5; j++) {
                                            eval("jf_arr" + j).push(__data[i].scores["z" + j]);
                                        }
                                        //htmlstr += '<span class="fr jf"></span>';
                                    }
                                }
                                htmlstr += '</div><div class="attr"><span class="line">' + baoyou_txt + '</span><span class="sales">已售<font class="fc_index_orangeRed">' + __data[i].sales_count + '</font>件</span>';
                                if (source_type == 1) {
                                    htmlstr += '<span class="">特卖商城</span>';
                                } else if (source_type == 0 && shop_type == 1) {
                                    htmlstr += '<span class="">去天猫</span>';
                                } else if (source_type == 0 && shop_type == 0) {
                                    htmlstr += '<span class="">去淘宝</span>';
                                }
                                htmlstr += '</div></div></a></li>';


                            }
                            htmlstr += '</ul>';
                            list.append(htmlstr);
                            list.find(".loading").remove();
                            list.find("ul").imglazyload({
                                "imgattr": "data-url"
                            });
                            var zhe_list_li = $(".list_W .list").find('ul').last().find("li");
                            $.zheui.bindTouchGoto(zhe_list_li, function(obj) {
                                var url_id = obj.attr("data-url");
                                var dealId = obj.attr("data-id");
                                bigData.setChart();
                                if (url_id.length > 0) {
                                    window.location.href = url_id;
                                }
                            });

                            //曝光统计
                            exposure.exposure_ev(list.find("ul"), "li");
                            if (usegrade == -1) {
                                //发送ajax请求，获取用户等级
                                $.ajax({
                                    type: "GET",
                                    url: "//zapi.zhe800.com/profile/grade?callback=?",
                                    dataType: "jsonp",
                                    success: function(udata) {
                                        if (udata.status == 0) {
                                            usegrade = 0;
                                        } else {
                                            usegrade = udata.grade.grade;
                                            if (usegrade > 5) {
                                                usegrade = 5;
                                            }
                                        }
                                        jf_init(list.find("ul").eq(0), eval("jf_arr" + usegrade));
                                    },
                                    error: function() {
                                        usegrade = 0;
                                        jf_init(list.find("ul").eq(0), jf_arr0);
                                    }
                                });
                            }

                            if (has_next) {
                                list_W.find(".loading_more").text("点击查看更多>>").show();
                            } else {
                                list_W.find(".loading_more").text("亲，没有更多了").show().addClass("no_more");
                            }

                        } else {
                            if (!has_next) {
                                list_W.find(".loading_more").text("亲，没有更多了").show().addClass("no_more");
                            }
                        }

                    } else {
                        list.find(".loading").text("数据加载失败，请稍后再试");
                    }
                },
                timeout: 20000,
                error: function() {
                    isload = false;
                    console.log("网络异常");
                    if (pagenum == 1) {
                        list.find(".loading").text("数据加载失败，请稍后再试");
                    } else {
                        list_W.find(".loading_more").text("数据加载失败，请稍后再试");
                    }
                    if ($.os.ios) {
                        $(".bg_layer3").hide();
                    }
                }
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
        transPassportCookie:function(){
            var ppsFLag = $.cookie.get("ppsFLag");
            if (ppsFLag == null || ppsFLag == undefined) {
                $.ajax({
                    type: "GET",
                    url: "https://passport.zhe800.com/j/users/refresh_app",
                    dataType: "jsonp",
                    jsonp: "callback",
                    success: function(data) {
                        $.cookie.set("ppsFLag","1");
                        return void 0;
                    },
                    timeout: 20000,
                    error: function() {
                        console.log("网络异常");
                    }
                });
            }else{
                return void 0;
            }
        },
        isLogin:function(){
            var that = this;
            $.ajax({
                type: "GET",
                url: "https://passport.zhe800.com/j/h5/auth/islogin?callback=?" + "&n=" + Math.random(),
                // url: "//th5hsm.zhe800.com/api/auth/islogin?callback=?&n=" + Math.random(),
                dataType: "jsonp",
                success: function(data) {
                    if (typeof data == "object") {
                        islogin = data.islogin;
                        if (islogin) {
                            that.transPassportCookie();
                        }
                    }
                }
            });
        },
        init: function() {
            //第三方渠道，触宝加载时不触发选择用户功能
            var utm_source = $.zheui.getUrlKeyVal("utm_source");
            if (utm_source != 'A_chubaohy') {
                //非第一次进入，并且未选中身份跳转至身份选择页
                if (user_role == "" && user_type == 1) {
                    this.seleRole();
                }
            };
            if($.os.android){this.isWebp = true;}
            //下拉列表状态标志
            this.up_flag = true;
            this.isLogin();
            this.isBaidu();
            this.getNav();
            // this.getCategory();
            this.getUserAgent();
            this.getToday();
            this.getUserStatus();
            bigData.init();
        }
    };
    //获取首页列表数据(第二页异步)
    var pagenum = 2;
    var isload = false;
    var usegrade = -1;
    HomePage.init();

    // 首页列表第一页数据处理
    var ul_1 = $(".list_W").find("ul").eq(0);
    ul_1.imglazyload({
        "imgattr": "data-url"
    });
    //第一页数据曝光
    exposure.exposure_ev(ul_1, "li");
    $.zheui.bindTouchGoto(ul_1.find("li"));
    //为同步数据更换out链接
    var href_new;
    $.each(ul_1.find('.flag_out'), function(o, p) {
        var outRequest = p.getAttribute("data-url");
        if (outRequest.match("http")) {
            // 自适应http和https，兼容曝光方案
            href_new = $.tracklog.outUrl(p.getAttribute("data-url"), {
                liststatus: 1,
                dealId: p.getAttribute("data-id")
            });
        }else{
            // 自适应http和https，兼容曝光方案
            href_new = $.tracklog.outUrl($.zheui.protocol+p.getAttribute("data-url"), {
                liststatus: 1,
                dealId: p.getAttribute("data-id")
            });
        };
        // console.log(href_new);
        //console.log("2",href_new);
        p.setAttribute("data-url", href_new);
    });

    //积分赋值
    function jf_init(o, p) {
        for (var i = 0; i < p.length; i++) {
            o.find(".jf").eq(i).html("+" + p[i] + "积分");
        }
    }

    //加载下一页商品列表
    $.zheui.bindTouchGoto($(".loading_more"), function(obj) {
        $.tracklog.action('loaddeal',track_data,'');
        var _this = obj;
        if (isload || _this.hasClass("no_more")) {
            return false;
        } else {
            _this.text("加载中...");
            if ($.os.ios) {
                if (!$(".bg_layer3").length) {
                    $("#ct").append('<div class="bg_layer3"></div>');
                }
                var bg_layer3 = $(".bg_layer3");
                bg_layer3.css("height", window.innerHeight + "px");
                bg_layer3.show();
            }
            HomePage.loadlist();
        }
    });

    //快捷入口
    $("#ct").append('<div id="floatQuick"><div class="inner"><span class="identity" data-url="/m/ucenter/role"></span><span class="xb" data-url="http://s.zhe800.com/ms/zhe800hd/app/xb/xb.html"></span></div></div>');

    $.zheui.bindTouchGoto($(".xb"), function(obj) {
        var _this = obj;
        window.location.href = _this.attr("data-url");
    });
    $.zheui.bindTouchGoto($(".identity"), function() {
        HomePage.seleRole();
    });
    $(window).bind("scroll", function() {
        var _wh = window.innerHeight;
        var _sctop = document.body.scrollTop;
        if (_sctop > _wh) {
            $("#floatQuick").hide();
        } else {
            $("#floatQuick").show();
        }
    });
    $("#floatGotop").on("click", function() {
        setTimeout(function() {
            window.scroll(0, 0);
        }, 100);
    });
    //topbar内按钮跳转
    $.zheui.bindTouchGoto($(".topbar").find("span"), function(obj) {
        var _this = obj;
        var url = _this.attr("data-url");
        if (url) {
            window.location.href = url;
        }
        if (_this.hasClass("cate_sou")) {
            $.tracklog.action("is",track_data,'');
        }else{
            $.tracklog.action('usercenter',track_data,'');
        }
    });

    //返回顶部
    $.zheui.bindTouchGoto($(".botm_gotop"), function(obj) {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 300);
    });

    //显示下载浮层
    showFloat.showDownloadGuide(true);
    showFloat.showTagGuide();

    $(document).on("focus", "#search_input", function() {
        $(this).parents('.search').animate({
            "width": "80%",
            "left": "10%"
        }, 500, 'ease-out', function() {
            $('#index_topbar').find('.logo').hide();
            $('#index_topbar').find('.user_in').hide();
            $('#index_topbar').find('#e_aboragte').show();
            // iSearch.get_data();
            $("#search_close").show();
        });
    });

    $(document).on("keyup", "#search_input", function() {
        $(this).parents('.search').animate({
            "width": "80%",
            "left": "10%"
        }, 500, 'ease-out', function() {
            $('#index_topbar').find('.logo').hide();
            $('#index_topbar').find('.user_in').hide();
            $('#index_topbar').find('#e_aboragte').show();
            // iSearch.get_data();
            $("#search_close").show();
        });
        //$(this).parents('.search').css({'width':'80%','left':'10%'});
    });

    $(document).on("blur", "#search_input", function() {
        // iSearch.blurr();
    });

    //搜索
    $.zheui.bindTouchGoto($("#search_close"), function() {
        // iSearch.search_btn();
    });


    $.zheui.bindTouchGoto($("#e_aboragte"), function() {
        iSearch.blurr();
    });



    $(document).on("click", ".list li", function() {
        var url_id = $(this).attr("data-url");
        var dealId = $(this).attr("data-id");
        if (url_id.length > 0) {
            window.location.href = url_id;
        }
    });

    //获取用户信息
    function getuserInfo() {
        if($.cookie.get("ppinf")){
            var uinfarr = $.cookie.get("ppinf").split("|");
            var u_jsonstr = base64str.utf8to16(base64str.decodeBase64(uinfarr[uinfarr.length - 1]));
            var u_json = JSON.parse(u_jsonstr);
            $("#user_name").html(u_json.userid);
        }
    };

    //品牌特卖入口
    $.zheui.bindTouchGoto($(".brand_way_store"), function(obj) {
        var url = obj.attr('data-url');
        $.tracklog.action("brand",track_data, '{eventvalue:more}');
        window.location.href = url;
    });

    //注销
    $.zheui.bindTouchGoto($("#quit"), function(obj) {
        var url = encodeURIComponent(window.location.href);
        window.location.href = "https://passport.tuan800.com/wap2/logout?domain=zhe800.com&return_to=" + url;
    });

    //进入注册页
    $.zheui.bindTouchGoto($("#register"), function(obj) {
        window.location.href = $.zheui.domain + "/register";
    });

    //页面底部“用户名”进入个人中心
    $.zheui.bindTouchGoto($("#user_name"), function(obj) {
        window.location.href = $.zheui.domain + "/m/ucenter/uindex";
    });
});