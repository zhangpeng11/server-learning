/*
* 值得逛
*/
define(function (require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");
    require("../common/track");
    require("../common/swipe");

    var dialog = require('../common/dialog');
    var mydialog = new dialog();

    var base64 = require('../common/base64');
    var base64str = new base64();

    //引入曝光统计
    var exposure = require("../common/exposure");

    //置顶功能
    var gotop = require("../common/gotop");
    gotop.init();

    //值得逛全局变量
    var home = {};
    home.nextpage = false;   //默认是否有下一页
    home.isload = false;     //是否在加载中
    home.page = 1;           //初始化页码
    home.perPage = 20;       //每页数量

    //用户信息
    var user = {};
    user.login = false;    //用户登录状态

    //新老用户标示，0：新用户，1：老用户
    user.userType = $.cookie.get("user_type");
    if (user.userType == null) {
        $.cookie.set("user_type", "1");
        user.userType = 0;
    }

    //获取用户身份
    user.userRole = $.cookie.get("user_role") || "";
    //非第一次进入，并且未选中身份跳转至身份选择页
    if(user.userRole=="" && user.userType==1){
        var htmlStr='';
        var roleVal="";
        htmlStr += '<span class="role-title">身份选择</span>'+
               '<i></i>'+
               '<div class="user-role-selec">'+
                    '<span>选择身份，只为给你私人定制更合适的商品</span>'+
                    '<div class="select-area">'+
                        '<div class="select-item boy" user_role="1"><div></div></div>'+
                        '<div class="select-item girl" style="margin:0 15px;" user_role="4"> <div></div></div>'+
                        '<div class="select-item mother" user_role="6"><div ></div></div>'+
                        '<div class="student"><div></div></div>'+
                    '</div>'+
                    '<div class="btn-area" >'+
                    '<span class="btn-cancel">取&nbsp;消</span>'+
                    '<span class="btn-sure">确&nbsp;认</span>'+  
                    '</div>'+
               '</div>';
    //创建浮层
    mydialog.create("2",htmlStr);
    // $(".bg_layer").bind("touchmove",function(e){
    //     return false;
    // });
      /*  window.location.href="/m/ucenter/role";*/
    $.zheui.bindTouchGoto($(".select-item"),function(obj){
        var _this = obj;
        roleVal = _this.attr('user_role');
        _this.find("div").addClass('on');
        _this.siblings(".select-item").find("div").removeClass('on');
        if(roleVal == "1" || roleVal == "4"){
            $(".student div").css("display","inline-block");
        }else if(roleVal == "6"){
            $(".student div").removeClass('on');
            $(".student div").css("display","none");
        }
    });
    $.zheui.bindTouchGoto($(".student"),function(obj){
        var _this = obj;
        _this.find("div").toggleClass('on');
    });
    $.zheui.bindTouchGoto($(".btn-cancel"),function(){
        mydialog.hide();
    });
    $.zheui.bindTouchGoto($(".btn-sure"),function(){
        if (roleVal == "") {
            mydialog.hide();
            return;
        }
        $.cookie.set("user_role",roleVal);
        if($(".student").find("div").hasClass("on")){
            $.cookie.set("student","1");
        }else{
            $.cookie.set("student","0");
        }
        //统计
        $.tracklog.action("model",{"t":roleVal});
        window.location.href = window.location.href;
        //mydialog.hide();
    });
    // 控制高度
    setTimeout(function(){
        var wh = window.innerHeight;
            var max = Math.max(wh,document.body.clientHeight); 
            $(".bg_layer").css("height",max+"px");
    },1000);
    }

    //点击功能封装 去除冒泡阻塞
    function bindTouchEvent ($els, callback) {
        var isMove;
        $els.each(function (index, ele) {
            $(ele).bind({
                "touchstart": function (e) {
                    isMove = false;
                },
                "touchmove": function (e) {
                    isMove = true;
                },
                "touchend": function (e) {
                    if (isMove) {
                        return;
                    }
                    if (typeof callback === "function") {
                        callback($(this), index);
                    }
                }
            });
        });
    }

    function loadBanners() {
        var $slide = $("#dacu_slide"),       //container
            $slidebar = $("#dacu_slidebar"), //slide bar
            $banners = $("#dacu_banners"),   //ul container
            $bannerLinks = $banners.find("a");    //a

        if ($banners.find("li").size() === 0) {
            $slide.hide();
            return;
        }

        $banners.find("li").css("width", $(document).width());
        $banners.css("width", $banners.find("li").size() * $(document).width() + "px");

        for (var i = 0; i < $bannerLinks.length; i++) {
            var $banner = $bannerLinks.eq(i),
                adtype = $banner.data("adtype"),
                addata = $banner.data("addata");

            if (adtype == "0") {
                $banner.attr("href", "/m/promotion/zt?s=banner&f=dacu&deals=" + addata);
            }
            else if (adtype == "1") {
                $banner.attr("href", addata);
            }
            else if (adtype == "2") {
                $banner.attr("href", $.tracklog.outUrl("http://out.tao800.com/m/deal/" + addata));
            }
            else if (adtype == "3") {
                $banner.attr("href", "/m/detail/detail?id=" + addata);
            }
        }

        $slide.imglazyload({"imgattr": "data-url"});

        $slidebar.find("span").eq(0).addClass("selected");
        //绑定滑动事件
        $slide.Swipe({
            startSlide: 0,
            continuous: false,
            disableScroll: false,
            stopPropagation: true,
            callback: function (index, element) {
                //console.log(index);
                //console.log(element);
            },
            transitionEnd: function (index, element) {
                $slidebar.find("span").removeClass("selected");
                $slidebar.find("span").eq(index).addClass("selected");
            }
        });
    }

    loadBanners();

    $("#dacu_category").imglazyload({"imgattr": "data-url"});

    function loadRecommends() {
        var $recommends = $("#dacu_recommend"),
            $recommendLinks = $recommends.find("a");

        for (var i = 0; i < $recommendLinks.length; i++) {
            var $recommend = $recommendLinks.eq(i),
                point = $recommend.data("point"),
                url = $recommend.data("url"),
                dealid = $recommend.data("dealid"),
                bannerid = $recommend.data("bannerid");

            if (point == "1" || point == "12") {
                $recommend.attr("href", url);
            }
            else if (point == "5") {
                $recommend.attr("href", "/m/promotion/zt?s=recommend&f=dacu&deals=" + dealid);
            }
            else if (point == "3") { //淘宝天猫详情
                $recommend.attr("href", $.tracklog.outUrl("http://out.tao800.com/m/deal/" + dealid));
            }
            else if (point == "31") { //特卖商城
                $recommend.attr("href", "/m/detail/detail?id=" + dealid);
            }
            else if (point == "11") {
                $recommend.attr("href", "/m/promotion/zt?s=recommend&f=dacu&id=" + bannerid);
            }
        }

        $recommends.imglazyload({"imgattr": "data-url"});
    }

    loadRecommends();

    //加载首页列表
    //@tag：加载的菜单项
    //@page：列表的页码，以1开始
    //价格以分为单位
    function loadHomeList(page) {
        home.page = page;
        home.isload = false;

        var url = "/v4/deals?per_page=" + home.perPage +"&page=" + page +
            "&user_role=" + user.userRole + "&user_type=" + user.userType + "&image_model=jpg";

        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function (data) {
                home.isload = true;
                home.nextpage = data.meta.has_next;

                if($.os.ios){
                    setTimeout(function(){
                        $(".bg_layer3").hide();
                    },300);
                }

                var listItems = data.objects,
                    html = "";
                    tpl = '<li data-id="#PRODUCT_ID#" data-url="#PRODUCT_URL#">' +
                        '<div class="pro_img">' +
                        '<img alt="#PRODUCT_TITLE#" src="http://i0.tuanimg.com/ms/zhe800h5/dist/img/img_120_80.png" width="115" height="80" data-url="#PRODUCT_IMG#">' +
                        '<i class="seo_img #PRODUCT_TYPE#" data-url="#PRODUCT_SEO#"></i>' +
                        '</div>' +
                        '<div class="pro_info">' +
                        '<div class="tit_area">' +
                        '<strong class="pad35">#PRODUCT_TITLE#</strong>' +
                        '<i class="#PRODUCT_STATUS#"></i>' +
                        '</div>' +
                        '<div class="attr">' +
                        '<span class="price">￥#PRODUCT_PRICE#</span><del>￥#PRODUCT_LIST_PRICE#</del>' +
                        '</div>' +
                        '<div class="attr2">' +
                        '<span>#PRODUCT_DISCOUNT#折</span><span>售出#PRODUCT_SALES#件</span><span>#PRODUCT_POST#</span>'
                        '</div>' +
                        '</div>' +
                        '</li>',
                    $list = $("#home_list"),
                    $listItems = null,
                    $loading = $("#loading_init"),
                    $loadingMore = $(".loading_more"),
                    $listEnd = $(".list_end");

                listItems.forEach(function (item, index) {
                    var status = "";

                    var begin_time = item.begin_time.replace("-", "/");     //开始时间
                    var now = new Date().valueOf();
                    var start = false;
                    if (now < begin_time) {
                        start = true;
                    }

                    if (item.oos == 1) {
                        status = "ico qiangwan";
                    }
                    else {
                        if (start) {
                            status = "ico nostart";
                        }
                        else if (item.zhuanxiang) {
                            status = "ico phone";
                        }
                        else if (item.today == 1) {
                            status = "ico new";
                        }
                    }

                    html += tpl.replace("#PRODUCT_ID#", item.id)
                        .replace("#PRODUCT_URL#", item.source_type == 0 ? item.wap_url : $.zheui.domain + "/m/detail/detail?id=" + item.id)
                        .replace("#PRODUCT_TYPE#", item.source_type == 1 ? "ico_temai" : "ico_tmall")
                        .replace(/#PRODUCT_SEO#/g, "/m/seoview?id=" + item.id + "&url_name=" + item.url_name)
                        .replace("#PRODUCT_IMG#", item.image_url.normal)
                        .replace("#PRODUCT_STATUS#", status)
                        .replace(/#PRODUCT_TITLE#/g, item.short_title)
                        .replace("#PRODUCT_PRICE#", item.price / 100)
                        .replace("#PRODUCT_LIST_PRICE#", item.list_price / 100)
                        .replace("#PRODUCT_DISCOUNT#", (item.price / item.list_price *10 ).toFixed(1))
                        .replace("#PRODUCT_SALES#", item.sales_count)
                        .replace("#PRODUCT_POST#", item.baoyou ? "包邮" : "不包邮");
                });

                $loading.hide();
                $list.append('<ul>' + html + "</ul>");

                $.zheui.bindTouchGoto($list.find(".seo_img"), function (element) {
                    var url = element.data("url");

                    if (url.length > 0) {
                        window.location.href = url;
                    }

                    return false;
                });

                //跳转品牌团商品列表页
                $listItems = $list.find("li");
                $.zheui.bindTouchGoto($listItems, function (element) {
                    var url = element.data("url");

                    if (url.length > 0) {
                        window.location.href = $.tracklog.outUrl(url);
                    }
                });

                $list.find("ul").imglazyload({"imgattr": "data-url"});
                //曝光统计
                exposure.exposure_ev($list, "li");
                if (home.nextpage) {
                    $(".loading_more").html('<span class="loading">点击加载更多&gt;&gt;</span>').show();
                    
                }
                else {
                    $loadingMore.hide();
                    $listEnd.show();
                }
            },
            timeout: 20000,
            error: function () {
                $(".loading").html("网络异常，请稍候再试");
            }
        });
    }

    loadHomeList(home.page);
/*
    //绑定加载下一页事件
    $(window).bind("scroll", function () {
        var wh = window.innerHeight;
        var sctop=document.body.scrollTop;
        var pageh = $("#ct").height();
        if((wh + sctop + 20) >= pageh) {
            if(home.nextpage && home.isload) {
                if($(".loading_more").length == 0) {
                    var html = '<div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div>';
                    $(".brand_main").append(html);
                }else{
                    $(".loading_more").html('<span class="loading"><i class="icon_load"></i>加载中......</span>').show();
                }
                var nextPage = home.page + 1;
                loadHomeList(nextPage);
            }
        }
    });
*/
    //积分赋值
    function jf_init(o,p){
        for(var i=0; i< p.length; i++){
            o.find(".jf").eq(i).html("+"+p[i]+"积分");
        }
    }

    //加载下一页商品列表
    $.zheui.bindTouchGoto($(".loading_more"), function (obj) {
        var $this = obj;

        console.log(home.isload)
        console.log(home.nextpage)

        if (!home.isload || !home.nextpage) {
            return false;
        }
        else {
            $(".loading_more").html('<span class="loading"><i class="icon_load"></i>加载中......</span>').show();
            if($.os.ios){
                if(!$(".bg_layer3").length){
                    $("#ct").append('<div class="bg_layer3"></div>');
                }
                var bg_layer3 = $(".bg_layer3");
                bg_layer3.css("height", window.innerHeight + "px");
                bg_layer3.show();
            }
            loadHomeList();
        }
    });

    //快捷入口
    $("#ct").append('<div id="floatQuick"><div class="inner"><span class="identity" data-url="/m/ucenter/role"></span><span class="xb" data-url="http://s.zhe800.com/ms/zhe800hd/app/xb/xb.html"></span></div></div>');
    $.zheui.bindTouchGoto($("#floatQuick").find("span"),function(obj){
        var _this = obj;
        window.location.href = _this.attr("data-url");
    });
    $(window).bind("scroll",function(){
        var _wh = window.innerHeight;
        var _sctop=document.body.scrollTop;
        if(_sctop > _wh){
            $("#floatQuick").hide();
        }else{
            $("#floatQuick").show();
        }
    });

    //topbar内按钮跳转
    $.zheui.bindTouchGoto($(".topbar").find("span"),function(obj){
        var _this = obj;
        var url = _this.attr("data-url");
        if(url){
            window.location.href = url;
        }
        if(_this.hasClass("cate_sou")){
            $.tracklog.action("is");
        }
    });

    //返回顶部
    $.zheui.bindTouchGoto($(".botm_gotop"),function(obj){
        setTimeout(function(){
            window.scrollTo(0,0);
        },300);
    });

    //是否显示下载浮层
    var utm_csr= $.cookie.get("utm_csr");
    if(utm_csr!='null'&&utm_csr!='direct'){
        $.ajax({
            type:"GET",
            url:"/m/supernatant?utm_source="+$.cookie.get("utm_csr"),
            success:function(data){
                if(data.show_download_view==1){
                    showdownFloat(1);
                }
            }
        })
    }else{
        showdownFloat(0);
    }

    //显示下载浮层
    function showdownFloat(url_type){
        var htmlstr ='<div class="download_float"><div class="inner"><div class="intro"><div class="img"></div><div class="txt"><h2>折800</h2><p class="ico_star"></p><p class="t">1.5亿用户正在使用，立即加入</p></div></div><div class="btn_down">立即打开</div><div class="close_area"><span class="ico_close"></span></div></div></div>';
        $("#ct").append(htmlstr);
      $.zheui.bindTouchGoto($(".download_float .close_area"),function(){
            $(".download_float").hide();
            if($.cookie.get("ishowfav")==null){
                showfavFloat();
            }
        });
        $.zheui.bindTouchGoto($(".download_float .btn_down"),function(){
            var utm_csr = $.cookie.get("utm_csr");
            var down_url="http://d.tuan800.com/dl/Zhe800_wap.apk";
            //调起客户端
            var iframe = document.getElementById('#openApp');
            if(iframe){
                iframe.src = 'zhe800://goto_home';
            }else{
                iframe = document.createElement('iframe');
                iframe.id = 'openApp';
                iframe.src = 'zhe800://goto_home';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            if($.os.ios){
                down_url = "http://w.tuan800.com/dl/app/recommend/redirect?from=guanwang&app=tao800&url=itunes.apple.com/cn/app/tao800-jing-xuan-du-jia-you-hui/id502804922?mt=8";
            }else{
                if(url_type==1){
                    down_url = "http://m.zhe800.com/download/bd/?bd="+utm_csr;
                }
            }
            window.location.href = down_url;
        });
    }

    //显示收藏浮层
    function showfavFloat(){
        var htmlstr ='<div class="favfloat"><p class="txt"></p><span class="arrow"></span><div class="close_area"><span class="ico_close"></span></div></div>';
        $("#ct").append(htmlstr);
        var favfloat = $(".favfloat");
        if(navigator.appVersion.indexOf("baidu")>-1){
            //baidu
            favfloat.show();
            favfloat.addClass("s3");
            favfloat.find(".txt").text("喜欢我，点击这里,再选择收藏 将我收藏吧");
        }else if(navigator.appVersion.indexOf("MQQ")>-1 || navigator.appVersion.indexOf("UCBrowser")>-1|| navigator.appVersion.indexOf("360 Aphone")>-1){
            //uc，qq，360
            favfloat.show();
            favfloat.addClass("s2");
            favfloat.find(".txt").text("喜欢我，点击这里,再选择收藏 将我收藏吧");
        }else if(navigator.appVersion.indexOf("LieBaoFast")>-1 || navigator.appVersion.indexOf("MI-ONE")>-1){
            //猎豹，小米
            favfloat.show();
            favfloat.addClass("s1");
            favfloat.find(".txt").text("喜欢我，点这里将我收藏吧");
        }else if(navigator.appVersion.indexOf("Safari")>-1){
            //iphone safari
            favfloat.show();
            favfloat.addClass("s2");
            favfloat.find(".txt").text("喜欢我，点这里将我添加到主屏幕吧");
        }
        $.zheui.bindTouchGoto($(".favfloat .close_area"),function(){
            $(".favfloat").hide();
            $.cookie.set("ishowfav","1");
        });
    }

    //获取用户登录状态
    $.ajax({
        type: "GET",
        url: "//th5.m.zhe800.com/api/auth/islogin?callback=?&n="+Math.random(),
        dataType: "jsonp",
        success: function (data) {
            if(typeof data =="object") {
                user.login = data.islogin;
                if (user.login) {
                    $(".footer .out").show();
                    $(".footer .in").hide();
                    getUserInfo();
                }
                else {
                    $(".footer .in").show();
                    $(".footer .out").hide();
                    //登录
                    $.zheui.bindTouchGoto($("#login"), function (obj) {
                        var url = encodeURIComponent(window.location.href);
                        window.location.href = "http://m.zhe800.com/login?return_to="+url;
                    });
                }
            }
        }
    });

    //获取用户信息
    function getUserInfo(){
        var uinfarr = $.cookie.get("ppinf").split("|");
        var u_jsonstr = base64str.utf8to16(base64str.decodeBase64(uinfarr[uinfarr.length - 1]));
        var u_json = JSON.parse(u_jsonstr);
        $("#user_name").html(u_json.userid);
    }

    //注销
    $.zheui.bindTouchGoto($("#quit"), function (obj) {
        var url = encodeURIComponent(window.location.href);
        window.location.href = "https://passport.tuan800.com/wap2/logout?domain=zhe800.com&return_to=" + url;
    });

    //进入注册页
    $.zheui.bindTouchGoto($("#register"), function (obj) {
        window.location.href = "https://passport.zhe800.com/wap3/users/new";
    });

    //页面底部“用户名”进入个人中心
    $.zheui.bindTouchGoto($("#user_name"), function (obj) {
        window.location.href = $.zheui.domain + "/m/ucenter/uindex";
    });
});
