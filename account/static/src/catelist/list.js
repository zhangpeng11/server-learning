/**
 * 精选预告  zhangpeng01 2016/8/22
 */
define(function(require, exports, module) {
    var $ = require("zepto");
    require('../common/base');
    require("../common/imglazyload");
    require("../common/callnative");
    var track_v2 = require("../common/track_v2");
    var Swipe = require("../common/swipe"),
        iScroll = require("../common/iscroll"),
        bigData = require('../common/bd'),
        exposure = require("../common/exposure");
    // AdaptApp = require("../common/adaptApp");

    //分类页数据显示 user_type:新老用户类型; user_role:用户身份类型
    var user_type = $.cookie.get("user_type") == null? 0:$.cookie.get("user_type");
    var user_role = $.cookie.get("user_role") == null? "":$.cookie.get("user_role");


    var categoryList = {

        init: function(){
            this.$navWrap = $("#navWrap");
            this.$subnavlist = this.$navWrap.find(".subnavlist");
            this.$navWrapdown = this.$navWrap.find(".sels_down ul");
            this.$categoryList = $('#category_list ul');
            this.up_flag = true;
            this.curUrlName = $.zheui.getUrlKeyVal('url_name');
            this.page = 1;
            this.nextPage = true;
            this.isload = true;

            // 检测是否支持webp
            this.isWebp = false;
            var _this = this;
            $.zheui.check_iswebp(function(i) {
                if ($.os.android) {
                    _this.isWebp = i;
                }
            });
            this.getNav();
        },

        getNav: function(){
            var _this = this;
            var cateData = JSON.parse($.localData.get('category_data'));
            if(cateData){
                _this.renderNav(cateData);
                
            }
            else{
                $.ajax({
                    type: "GET",
                    url: "/m/tags/v2?user_type=" + user_type + "&user_role=" + user_role + "&vt=" + new Date().getTime(),
                    dataType:"json",
                    success: function(data){ 
                        $.localData.set('category_data', JSON.stringify(data));
                        console.log('getNav,data:', data);
                        _this.renderNav(data);
                    },
                    timeout: 20000,
                    error: function() {
                        _this.listInit();
                    }
                });
            }
        },

        renderNav: function(data){
            var _this = this;
            if (!(data && data.length)) {
                _this.$navWrap.hide();
                return;
            } else {
                _this.$navWrap.show();
                _this.$navWrap.find(".icon").show();
            }
            var navData = data;
            var navHtml = '';
            var navdownHtml = '';


            navData.forEach(function(item, index){
                if(item.level == 1){
                    navHtml +='<span class="navItem" url-name="'+ item.url_name +'">'+item.category_name+'<i class="icon_sel"></i></span>';
                    navdownHtml +='<li class="navdownItem" url-name="'+ item.url_name +'">'+ item.category_name +'<span></span></li>';
                }
            });
            navdownHtml += '<li class="moreCategory"><span>更多分类<i></i></span></li>';
            _this.$subnavlist.append(navHtml);
            _this.$navList = _this.$subnavlist.find("span");
                                    console.log(new Date().getTime());
            _this.navScroll();
                                    console.log(new Date().getTime());
            // alert("done");
            _this.$navWrapdown.append(navdownHtml);
            _this.$navlist_down = _this.$navWrapdown.find("li");
            _this.subNavHeight = $(".sels_down ul").height();

            _this.navupdown();
            _this.tabFn();
            _this.winScroll();
            _this.navCur();
            
        },

        getCateList: function(){
            var _this = this;
            var cateData = JSON.parse($.localData.get('category_data'));
            var cateListHtml = '';
            
            cateData.forEach(function(item, index){
                var picUrl = item.pic;

                //不支持webp情况下修改图片格式
                if(!_this.isWebp && picUrl.indexOf('.webp') != -1){
                    picUrl = picUrl.replace('.webp','');
                }
                if(item.parent_url_name == _this.curUrlName){
                   cateListHtml += '<li><a href="/m/list/'+item.url_name+'?url_name='+item.url_name+'&category_name='+encodeURI(item.category_name)+'&parent_url_name='+item.parent_url_name+'" data-id="'+item.id+'" data-val="'+item.url_name+'/'+item.url_name+'"><img src='+picUrl+' width="50" height="50"><span>'+item.category_name+'</span></a></li>';
                }
            });
            _this.$categoryList.append(cateListHtml);
        },

        listInit: function(){
            var _this = this;
            _this.isload = false;
            var data = {
                per_page:20,
                image_type:'small',
                image_model: 'jpg',
                page: _this.page,
                user_type: user_type,
                user_role: user_role,
                tag_url: _this.curUrlName,
                parent_url_name:'',
                shop_type: '',
                path_url: _this.curUrlName,
                url_name: _this.curUrlName
            };
            $.ajax({
                type: 'GET',
                url:  '/m/api/list/'+ _this.curUrlName,
                data: data,
                success: function(data){
                    $('#zhe_list_bg').hide().css('background-color', 'rgba(0,0,0,0.6)');
                    if(data){
                        var objects = data.objects;
                        $(".loading_more").hide();
                        var listHtml = '<ul class="zhe_list" id="zhe_list'+_this.page+'">';
                        var load_img = "//i0.tuanimg.com/ms/zhe800wx/dist/img/img_placehd.png";
                        var jf_arr0 = [],
                            jf_arr1 = [],
                            jf_arr2 = [],
                            jf_arr3 = [],
                            jf_arr4 = [],
                            jf_arr5 = [];
                        _this.isload = true;
                        _this.nextPage = data.meta.has_next;
                        for (var i = 0; i < objects.length; i++) {
                            var zhuanxiang = objects[i].zhuanxiang; //手机专享
                            var today = objects[i].today; //0：旧，1：新（new）
                            var source_type = objects[i].source_type; //商品来源 ：1--是商城，0--是淘宝/天猫
                            var shop_type = objects[i].shop_type; //商铺类型：0--淘宝；1--天猫
                            var deal_type = objects[i].deal_type;
                            var brand_product_type = objects[i].brand_product_type;
                            var baoyou = objects[i].baoyou; //包邮
                            var begin_time = objects[i].begin_time.replace("-", "/"); //开始时间
                            begin_time = new Date(begin_time).valueOf();
                            var list_price = objects[i].list_price / 100; // 原价
                            var price = objects[i].price / 100; //折扣价
                            var zhekou = (price / list_price * 10).toFixed(1); //折扣
                            var oos = objects[i].oos; //0代表未卖光，1代表已卖光
                            var brand_id = objects[i].brand_id; //品牌团id
                            var now = new Date().valueOf();
                            var start = false;
                            if (now < begin_time) {
                                start = true;
                            }
                            var url = "";
                            if (source_type == 1) {
                                url = $.tracklog.outUrl($.zheui.domain + "/m/detail/" + objects[i].id, {
                                    liststatus: 1,
                                    dealId: objects[i].id
                                });
                            } else {
                                url = $.tracklog.outUrl(objects[i].wap_url, {
                                    liststatus: 1,
                                    dealId: objects[i].id
                                });
                            }
                            if (brand_id > 0) {
                                //补足进入品牌团列表页参数
                                listHtml += "<li data-url='/m/brand/list?brand_id=" + brand_id + "&include_deal_id=" + objects[i].id + "' data-id='" + objects[i].id + "'><a href='javascript:void(0);'>";
                                //品牌团
                                listHtml += '<div class="icon pptm" ></div>';
                            } else {
                                listHtml += "<li data-url='" + url + "' data-id='" + objects[i].id + "'><a href='javascript:void(0);'>";
                            }
                            listHtml += "<dl class='item'><dt>";
                            listHtml += "<img src='" + load_img + "' data-url='" + objects[i].square_image + "' width='130' height='130' alt=''>";
                            if (brand_id > 0) {
                            //品牌团
                                listHtml += '<div class="icon pptm" ></div>';
                            }
                            if (deal_type == 3) {
                                //优品汇
                                listHtml += '<div class="icon yph" ></div>';
                            } else if (today == 1) {
                                //今日上新
                                listHtml += '<div class="icon jrsx" ></div>';
                            }
                            listHtml += "</dt><dd><div class='tit_area'>";
                            if (oos == 1) {
                                listHtml += "<span class='title longbig'>" + objects[i].short_title + "</span>";
                                listHtml += "<div class='icon qiangwan'></div>";
                            } else {
                                if (start) {
                                    listHtml += "<span class='title long'>" + objects[i].short_title + "</span>";
                                    listHtml += "<div class='icon nostart'></div>";
                                } else {
                                    listHtml += "<span class='title'>" + objects[i].short_title + "</span>";
                                }
                            }
                            listHtml += "</div>";
                            listHtml += "<div class='attr'>";
                            listHtml += "<span class='price'>￥" + price + "</span>";
                            listHtml += "<del>￥" + list_price + "</del>";
                            listHtml += "</div>";
                            listHtml += "<div class='attr'>";
                            if (baoyou) {
                                listHtml += "<span class='discount'><i class='by'>包邮</i></span>";
                            } else {
                                listHtml += "<span class='discount'></span>";
                            }
                            listHtml += "<span class='sale_num'>售出<font class='fc_index_orangeRed'>" + objects[i].sales_count + "</font>件</span>";
                            if (source_type == 1) {
                                listHtml += "<span class='mail'>特卖商城</span>";
                            } else {
                                if (shop_type == 0) {
                                    listHtml += "<span class='mail'>去淘宝</span>";
                                }
                                if (shop_type == 1) {
                                    listHtml += "<span class='mail'>去天猫</span>";
                                }
                            }
                            listHtml += "</div></dd></dl></a></li>";
                        }
                        listHtml += "</ul>";
                        $("#loading_init").hide();
                        if(_this.page == 1){
                            $("#zhe_list_main").empty().append(listHtml);
                        }else{
                            $("#zhe_list_main").append(listHtml);
                        }

                        $("#loading").hide();
                        $("#clist_main").show();
                        $(".zhe_list").imglazyload({
                            "imgattr": "data-url"
                        });
                        //曝光统计
                        exposure.exposure_ev($("#zhe_list_main > ul"), "li");
                        if (!_this.nextPage) {
                            if ($(".list_end").length) {
                                $(".list_end").show();
                            } else {
                                $(".zhe_list_w").append("<div class='list_end'><span></span></div>");
                            }
                        } else {
                            if ($(".loading_more").length == 0) {
                                var html = "<div class='loading_more'><span class='loading'>查看更多</span></div>";
                                $("#zhe_list_main").append(html);
                            } else {
                                $(".loading_more").html("<span class='loading'>查看更多</span>").show();
                            }
                        }

                        //页面高度控制
                        var win_height = window.innerHeight;
                        var ct_height = parseInt($("#ct").css("height"));
                        if (ct_height < win_height) {
                            $(".zhe_list_w").css("height", win_height - 44 + "px");
                        }

                        //触发异步数据选中效果
                        var zhe_list_li = $("#zhe_list_" + _this.page).find("li");
                        $.zheui.bindTouchGoto(zhe_list_li);
                        if (_this.user_status == null) {
                            //发送ajax请求，获取用户等级
                            $.ajax({
                                type: "GET",
                                //url: $.zheui.protocol+"//zapihs.zhe800.com/profile/grade?callback=?",
                                url: $.zheui.protocol + "//zapi.zhe800.com/profile/grade?callback=?",
                                dataType: "jsonp",
                                success: function(udata) {
                                    if (udata.status == 0) {
                                        _this.user_status = 0;
                                    } else {
                                        _this.user_status = udata.grade.grade;
                                        if (_this.user_status > 5) {
                                            _this.user_status = 5;
                                        }
                                    }
                                    _this.js_init($("#zhe_list_" + _this.page), eval("jf_arr" + _this.user_status));




                                },
                                error: function() {
                                    _this.user_status = 0;
                                    _this.js_init($("#zhe_list_" + o), jf_arr0);
                                }
                            });
                        }
                    }
                    else {
                        //页面高度控制
                        var win_height = window.innerHeight;
                        //$(".btn_filter").unbind();
                        $("#zhe_list_main").html("<span class='no_list_mes'></span>");
                        $("#loading").hide();
                        $("#clist_main").show();
                    }
                },
                timeout: 20000,
                error: function() {
                    if (_this.page == 2) {
                        //第一页异步数据加载失败处理
                        $("#loading").text("加载失败，点击重新加载");
                        $.zheui.bindTouchGoto($("#loading"), function() {
                            $("#loading").html("<span class='icon'></span><span class='txt'>努力加载中...</span>");
                            _this.listInit();
                        });
                    } else {
                        //后面页加载失败处理
                        $(".loading_more").html("<span class='load_fail'>加载失败，点击重新加载</span>");
                        $.zheui.bindTouchGoto($(".loading_more"), function() {
                            _this.listInit();
                            $(".loading_more").html("<span class='loading'><i class='icon_load'></i>加载中......</span>");
                        });
                    }
                }
            });
        },

        //页面跳转后设置当前页面信息
        navCur: function(){
            var _this = this;
            _this.curUrlName = $.zheui.getUrlKeyVal("url_name");
            var curObj = $('.subnavlist span[url-name = "'+_this.curUrlName+'"]');
            curObj.addClass("selected").siblings().removeClass("selected");
            $('.navdownItem[url-name = '+_this.curUrlName+']').addClass("selected").siblings().removeClass("selected");

            if (curObj.prev().prev().length != 0) {
                _this.scrollObj.scrollToElement(curObj.prev().prev().get(0), 200);
            }
            else{
                _this.scrollObj.scrollTo(0, 0, 200);
            }
            document.body.scrollTop = 0;

            _this.getCateList();

            // this.listInit();
        },
        /*
       导向横向滑动
      */
        navScroll: function() {
            var scrollWidth = 0,
                _this = this;
            _this.$navList.forEach(function(item) {
                $(item).attr("data-left", scrollWidth);
                scrollWidth += $(item).width();
            });
            scrollWidth += 10;
            _this.$subnavlist.width(scrollWidth);
            _this.scrollObj = new iScroll(jcy_navList, {
                snap: false,
                momentum: false,
                hScrollbar: false,
                onScrollEnd: function() {}
            });
        },
        /*
       下拉的属性
      */
        navupdown: function() {
            var _this = this;
            _this.$navupdown = _this.$navWrap.find(".icon");
            _this.$navWrapdown = $(".sels_down ul");
            _this.$navupdown.addClass("navdown");
            this.bindTouchEvent($(".opcity"), function() {
                $('#navWrap .index.navItem').css('display','block');
                $('#navWrap .line').css('display','block');
                $('#navWrap .navdownShow').css('display','none');
                _this.$subnavlist.css('display', 'block');
                $(".opcity").css("display", "none");
                $("#ct").css("height", "auto");
                var nav_height = _this.up_flag ? $('#navWrap').height() : (-1) * _this.subNavHeight;
                _this.up_flag = !_this.up_flag;
                _this.$navWrapdown.animate({
                    top: (-1) * (_this.subNavHeight + _this.$navWrapdown.offset().top)
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
                var nav_height = _this.up_flag ? $('#navWrap').height() : (-1) * (_this.subNavHeight + _this.$navWrapdown.offset().top);
                _this.up_flag = !_this.up_flag;
                _this.$navWrapdown.animate({
                    top: nav_height
                }, 200);
                if (nav_height == $('#navWrap').height()) {
                    $('#navWrap .index.navItem').css('display','none');
                    $('#navWrap .line.left').css('display','none');
                    $('#navWrap .navdownShow').css('display','block');
                    _this.$subnavlist.css('display', 'none');
                    $(".sels_down").css("display", "block");
                    $(".opcity").css("display", "block");
                    swi_height = document.documentElement.clientHeight + 'px';
                    $("#ct").css("height", swi_height);
                    $(".icon_down").animate({
                        "-webkit-transform": 'rotateZ(-180deg)',
                        "transition": "all 0.2s ease-in-out"
                    }, 'fast')
                } else {
                    $('#navWrap .index.navItem').css('display','block');
                    $('#navWrap .line.left').css('display','block');
                    $('#navWrap .navdownShow').css('display','none');
                    _this.$subnavlist.css('display', 'block');
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

        winScroll:function(){
            var _this = this;
            var scrollTop = $(window).scrollTop();
            var conH = $("#ct").height();
            var winH = window.innerHeight;
            //滑动加载下一页
            $(window).bind('scroll', function(){
               var wh = window.innerHeight;
                var sctop = document.body.scrollTop;
                var pageh = $("#ct").height();
                if ((wh + sctop + 20) >= pageh) {
                    if (_this.nextPage&& _this.isload) {
                        if ($(".loading_more").length == 0) {
                            var html = '<div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div>';
                            $("#zhe_list_main").append(html);
                        } else {
                            $('.loading_more').html('<span class="loading"><i class="icon_load"></i>加载中......</span>').show();
                        }
                        console.log(_this.page);
                        _this.page ++;
                        _this.listInit();
                    }
                    
                }
                if(!_this.nextPage){
                    $('loading_more').html('<span class="loading"><i class="icon_load"></i>没有更多啦~</span>').show();
                }
            });
            //分类栏滑动吸顶
            var topBar = $('.topbar');
            $(window).bind('scroll', function(){
                if($('body')[0].scrollTop > topBar.height() + topBar.offset().top){
                   //  $('#navWrap').css('position','fixed');
                   // $('#navWrap').css('top',0);
                   $('#navWrap').addClass('fixed');
                }
                else{
                    // $('#navWrap').css('position','relative');
                    // $('#navWrap').css('top',0); 
                    $('#navWrap').removeClass('fixed');
                }
            });
        },

        //点击分类栏跳转其他页面
        tabFn: function(){
            var _this = this;
            var navList = $('.subnavlist span');
            var navlist_down = $('.sels_down .navdownItem');
            var moreCategory = $('.sels_down .moreCategory');
            var index = $('.navItem.index');
            var indexDownItem = $('.navdownItem.index');

            //点击上方分类跳转
            this.bindTouchEvent(navList, function(t){
                var urlName = t[0].getAttribute('url-name');
                var categoryName = t[0].innerText;
                window.location.href = '/m/catelist/'+urlName+'?url_name='+urlName+'&category_name='+encodeURI(categoryName);
            });

            //点击下拉列表跳转
            this.bindTouchEvent(navlist_down, function(t){
                var urlName = t[0].getAttribute('url-name');
                var categoryName = t[0].innerText;
                window.location.href = '/m/catelist/'+urlName+'?url_name='+urlName+'&category_name='+encodeURI(categoryName); 
            });

            //点击更多分类跳转分类页
            this.bindTouchEvent(moreCategory, function(){
                window.location.href  = '/m/category/category';
            }); 

            //点击推荐跳转首页
            this.bindTouchEvent(index, function(){
                window.location.href  = '/';
            });  

                        //点击推荐跳转首页
            this.bindTouchEvent(indexDownItem, function(){
                window.location.href  = '/';
            });  
        },  
  
        //积分赋值  
        js_init: function (o, p) {  
            for (var i = 0; i < p.length; i++) {
                o.find(".integral").eq(i).html("+" + p[i] + "积分");
            }
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
        }

    };

    categoryList.init();
    categoryList.listInit();

    //绑定列表点击事件
    $(document).on("click", "#zhe_list_main li", function() {
        var url_id = $(this).attr("data-url");
        var dealId = $(this).attr("data-id");
        if (url_id.length > 0) {
            window.location.href = url_id;
        }
    });

    // 首页列表第一页数据处理
    //初始化页面高度
    var win_height = window.innerHeight;
    $(".zhe_list_w").css("min-height", win_height - 44 + "px");

    //第一页数据曝光
    exposure.exposure_ev($("#zhe_list_1"), "li");

    // 第一页选中效果
    $.zheui.bindTouchGoto($("#zhe_list_1 li"));

    //图片懒加载
    $(".zhe_list").imglazyload({
        "imgattr": "data-url"
    });
    //为同步数据更换out链接
    $.each($("#zhe_list_1").find("li"), function(o, p) {
        var href_new;
        href_new = $.tracklog.outUrl($(p).attr("data-url"), {
            liststatus: 1,
            dealId: $(p).attr("data-id")
        }); 
        p.setAttribute("data-url", href_new);
    });

    //topbar内按钮跳转
    $.zheui.bindTouchGoto($(".topbar").find("span"), function(obj) {
        var _this = obj;
        var url = _this.attr("data-url");
        if (url) {
            window.location.href = url;
        }
    });
});