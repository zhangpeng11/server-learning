/*
 * 品牌团
 *@author:wangguanjia
 *@email:wangguanjia@rdj.tuan.comm
 *@modify time:2015.10.28
 * */
define(function(require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");

    $.cookie.set("pos_value","bdlst");
    $.cookie.set("pos_type","bdlst_"+$.zheui.getUrlKeyVal("brand_id"));
    var track = require("../common/track_v2");
    track.init("m");
    var track_data = {
      pos_type:"bdlst",
      pos_value:"bdlst_"+$.zheui.getUrlKeyVal("brand_id")
    };


    //引入曝光统计
    var exposure = require("../common/exposure");
    //置顶功能
    var gotop = require("../common/gotop");
    var showFloat = require('../common/show_float');
    // define brand class
    var brand = {
        nextpage: false, //默认是否有下一页
        isload: false, //是否在加载中
        isFresh:false,
        page: 1, //初始化页码
        perPage: 20, //每页数量
        end_time: new Date(),
        order:'',//排序
        $filterWrap:$("#brand_filter"),
        $filterTitle:$("#brand_filter_title"),
        id: $.zheui.getUrlKeyVal("brand_id"), //品牌ID
        urlName: $.zheui.getUrlKeyVal("url_name"), //品牌URL_NAME
        info: $.localData.get(""+this.id+"_brandInfoData"), //品牌信息
        /*
        *@method:获取列表数据
        *@type:0为正常详情页，1为明日预告
        */
        loadBrandList: function(type,id,urlName,page) {
            // $("#brand_list_items").hide();
            $("#loading_init").show();
            brand.page = page;
            brand.isload = false;
            var _this = this;
            var include_deal_id = $.zheui.getUrlKeyVal("include_deal_id");
            var beginTime = brand.begin_time/1000;
            if(type == 0){
                if(include_deal_id != ""){
                    var url = "getdealsbyid?order=" + brand.order + "&per_page=" + brand.perPage + "&page=" + page + "&brand_id=" + id + "&url_name=" + urlName + "&include_deal_id=" + include_deal_id + "&image_model=jpg";
                }else{
                    var url = "getdealsbyid?order=" + brand.order + "&per_page=" + brand.perPage + "&page=" + page + "&brand_id=" + id + "&url_name=" + urlName + "&image_model=jpg";
                }
            }else if(type == 1){
                var url = "getdealsbyid?order=" + brand.order + "&per_page=" + brand.perPage + "&page=" + page + "&brand_id=" + id + "&url_name=" + urlName + "&begin_time=" + beginTime + "&new=0&image_model=jpg";
            }
            $.ajax({
                type: "GET",
                url: url,
                dataType: "json",
                success: function(data) {
                    console.log("load brand list", data);
                    brand.isload = true;
                    brand.nextpage = data.meta.has_next;
                    
                    var listItems = data.objects,
                        titleTpl = '<img src="#BRAND_LOGO#"><h3>#BRAND_NAME#</h3><p>#BRAND_TITLE#</p></aside>',
                        ruleTpl = '#BRAND_RULE#<time>#BRAND_TIME#</time>',
                        listTpl = '<li data-url="#DETAIL_URL#" data-id="#DEALID#">' +
                        '<span class="icon #ITEM_TYPE#"></span>' +
                        '<span class="mark_qiangwan" #ITEM_QIANGG#></span>' +
                        '<img src="//i0.tuanimg.com/ms/zhe800m/dist/img/img_151_170.jpg" data-url="#ITEM_IMAGE#">' +
                        '<div class="price_line"><span class="pprice">￥#NEW_PRICE#</span><del>￥#OLD_PRICE#</del></div>' +
                        '<div class="dis_line">' +
                        '<span class="p_zhe">#ITEM_BAOYOU#</span>' +
                        '<span class="sales">已售<font class="fc_index_orangeRed">#SALES_COUNT#</font></span>' +
                        '<span class="postage">#ITEM_TEMAI#</span>' +
                        '</div>' +
                        '<div class="item_tt"><span>#ITEM_TITLE#</span></div>' +
                        '</li>',
                        $brandInfo = $("#brand_info"),
                        $brandRule = $("#brand_rule"),
                        $listItems = $("#brand_list_items"),
                        $loading = $("#loading_init"),
                        $loadingMore = $(".loading_more"),
                        $listEnd = $(".list_end"),
                        $brandListItems = null,
                        html = '';
                    if(listItems.length > 0){
                        listItems.forEach(function(item) {
                            var detail_url = (item.source_type == 1) ? ($.zheui.domain + "/m/detail/" + item.id) : item.wap_url;
                            if (item.deal_type == 2 || item.deal_type == 3) {
                                //主题馆或者优品汇 
                                detail_url = item.wap_url;
                            }
                            var detail_type = "";
                            if (item.deal_type == 3) {
                                //优品汇
                                detail_type = "yph";
                            } else if (item.today == 1 && item.brand_product_type != 1) {
                                //今日上新
                                detail_type = "jrsx";
                            }else if(item.brand_product_type == 1){
                                detail_type = "bktj"
                            }

                            html += listTpl.replace("#ITEM_TEMAI#", (item.source_type == 1) ? '特卖商城' : (item.shop_type == 0 ? "去淘宝" : "去天猫"))
                                .replace("#ITEM_QIANGG#", (item.oos == 0) ? 'style="display:none;"' : '')
                                .replace("#ITEM_TYPE#", detail_type)
                                .replace("#DETAIL_URL#", detail_url)
                                .replace("#ITEM_IMAGE#", item.square_image)
                                .replace("#DEALID#", item.id)
                                .replace("#NEW_PRICE#", item.price / 100)
                                .replace("#OLD_PRICE#", item.list_price / 100)
                                .replace("#SALES_COUNT#", item.sales_count)
                                .replace("#ITEM_BAOYOU#", item.baoyou ? '<i class="by">包邮</i>' : "")
                                .replace("#ITEM_TITLE#", item.short_title);
                        });
                        $loading.hide();
                        if($listItems.find("li").length > 0 && brand.isFresh == false){
                            $listItems.append(html);
                        }else if($listItems.find("li").length > 0 && brand.isFresh == true){
                            $listItems.empty().append(html);
                            brand.isFresh = false;
                        }else{
                            $listItems.empty().append(html);
                        }
                        //跳转品牌团商品详情页
                        var $brandListItems = $listItems.find("li");
                        $.zheui.bindTouchGoto($brandListItems, function(element) {
                            var url = element.data("url");
                            var dealId = element.attr("data-id");
                            if (url.length > 0) {
                                $.cookie.remove("c_url_name");
                                window.location.href = $.tracklog.outUrl(url, {
                                    liststatus: 0,
                                    dealId: dealId
                                });
                            }
                        });

                        $listItems.imglazyload({
                            "imgattr": "data-url"
                        });
                        //曝光统计
                        exposure.exposure_ev($listItems, "li");
                    }else{
                        $("#loading_init").hide();
                        $(".loading_more").hide();
                        $listItems.empty().append('<div class="not_data"><i></i>暂无符合条件的数据</div>');
                        $(".list_end").hide();
                    }
                    if(data.meta.has_next == false && $listItems.find("li").length > 0){
                                $("#loading_init").hide();
                                $(".loading_more").hide();
                                $(".list_end").show();
                                return;
                    }else{
                                $(".list_end").hide();
                    }

                    if (brand.nextpage) {
                        $loadingMore.hide();
                    } else {
                        $loadingMore.hide();
                        // $listEnd.show();
                    };
                },
                timeout: 20000,
                error: function() {
                    $(".loading").html("网络异常，请稍候再试");
                }
            });
        },
        /* 
        *@method:加载品牌团信息
        */
        loadBrandInfo: function(id) {
            var that = this;
            $.ajax({
                type: "GET",
                url: 'getbrandbyid?brand_id=' + id + '&image_model=jpg',
                dataType: "json",
                success: function(data) {
                    var obj = data.objects[0],
                        $brandInfo = $("#brand_info"),
                        $brandFilterTitle = $("#brand_filter_title"),
                        $brandAvatar = $('#brand_avatar'),
                        $brandLogo = $("#brand_logo"),
                        $brandTitle = $("#brand_title"),
                        $brandDes = $("#brand_des"),
                        $brandRule = $("#brand_rule"),
                        $brandTick = $("#brand_tick"),
                        $listItems = $("#brand_list_items"),
                        html = '';
                        console.log("load Brand Info",obj);
                        if (obj != null && obj != undefined) {
                            $brandLogo.find('img').attr('src',obj.logo_image);
                            $brandTitle.text(obj.name);
                            $brandFilterTitle.find('.title').text(obj.name);
                            $brandDes.text(obj.title);
                            // alert($.zheui.getUrlKeyVal("brand_info").rule);
                            if($.zheui.getUrlKeyVal("brand_info") != ""){
                                if(JSON.parse($.zheui.getUrlKeyVal("brand_info")).rule && JSON.parse($.zheui.getUrlKeyVal("brand_info")).rule != "" && JSON.parse($.zheui.getUrlKeyVal("brand_info")).rule != undefined){
                                    $brandRule.text(JSON.parse($.zheui.getUrlKeyVal("brand_info")).rule);
                                    $brandRule.show();
                                }else{
                                    $brandRule.hide();
                                };
                            }else{
                                $brandRule.hide();
                            }
                            brand.end_time = obj.end_time;
                            brand.begin_time = obj.begin_time;
                            if(that.isPresell() == 1){
                                that.loadBrandList(1,that.id, that.urlName, that.page);
                            }else if(that.isPresell() == 0){
                                that.loadBrandList(0,that.id, that.urlName, that.page);                
                            };
                            tick();

                            // $brandInfo.html(titleTpl.replace("#BRAND_LOGO#", obj.logo_image)
                            //         .replace("#BRAND_NAME#", obj.name)
                            //         .replace("#BRAND_TITLE#", obj.title ? obj.title : obj.discount + "折 ￥" + obj.low_price + "元"));

                            // $brandRule.html(ruleTpl.replace("#BRAND_RULE#", obj.rule ? "<p>" + obj.rule + "</p>" : "")
                            //     .replace("#BRAND_TIME#", obj.end_time));
                        }else{
                            $brandInfo.hide();
                            $brandRule.hide();
                            $brandTick.hide();
                        }
                    //console.log("load brand info", typeof(obj));
                    //$("#brand_info").find('img').attr('src',obj.logo_image);

                },
                timeout: 20000,
                error: function() {
                    $(".loading").html("网络异常，请稍候再试");
                }
            });
        },
        // 加载品牌团cookie
        loadBrandCookie: function() {
            $.cookie.set("c_url_name", this.urlName, 1, "/", "zhe800.com", false);
            if (this.urlName === "yesterday" || this.urlName === "today" || this.urlName === "last") { //昨日上线 今日上线 最后疯狂
                this.urlName = "all";
            }
        },
        // 倒计时事件
        tick: function() {
            var EndTime= new Date(brand.end_time); 
            var NowTime = new Date();
            var t =EndTime.getTime() - NowTime.getTime();
            var d=Math.floor(t/1000/60/60/24);
            var h=Math.floor(t/1000/60/60%24);
            var m=Math.floor(t/1000/60%60);
            var s=Math.floor(t/1000%60);
            $('#brand_tick').find('.day').text(d);
            $('#brand_tick').find('.hour').text(h);
            $('#brand_tick').find('.minute').text(m);
            $('#brand_tick').find('.second').text(s);
        },
        //绑定加载下一页事件
        bindScroll: function() {
            $(window).bind("scroll", function() {
                var wh = window.innerHeight;
                var sctop = document.body.scrollTop;
                var pageh = $("#ct").height();
                if ((wh + sctop + 20) >= pageh) {
                    if (brand.nextpage && brand.isload) {
                        if ($(".loading_more").length == 0) {
                            var html = '<div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div>';
                            // $(".brand_main").append(html);
                        } else {
                            // $(".loading_more").html('<span class="loading"><i class="icon_load"></i>加载中......</span>').show();
                        }
                        var nextPage = brand.page + 1;
                    	// #108964 此处 this 变量使用错误，此处 this 变量默认将指向 window 对象，所以代码在此处报错。
						// 在此函数外使用 bind 重新使 this 指向了正确的值。
                        if(this.isPresell() == 1){
                            this.loadBrandList(1,brand.id, brand.urlName, nextPage);
                        }else if(this.isPresell() == 0){
                            this.loadBrandList(0,brand.id, brand.urlName, nextPage);                
                        }
                    }
                }
            }.bind(this));
        },
        // 下拉滚动交互
        winScroll: function() {
            var topNum = this.$filterWrap.offset().top,
                _this = this;
            $(window).bind("scroll", function() {
                var scrollTop = $(window).scrollTop(),
                    conH = $("#ct").height();
                //导航固定
                if (topNum <= scrollTop) {
                    _this.$filterWrap.addClass("fixed50");
                    _this.$filterTitle.addClass("fixed").show();
                } else {
                    _this.$filterWrap.removeClass("fixed50");
                    _this.$filterTitle.removeClass("fixed").hide();
                }
            })
        },
        // 判断是否是明日更新商品
        isPresell:function(){
            var NowTime = new Date().getTime(),
                BeginTime = brand.begin_time,
                EndTime = brand.end_time;
            if (BeginTime - NowTime > 0 && EndTime - NowTime > 0) {
                // 明日更新
                return 1;
            }else{
                return 0;
            }
        },
        // 初始化加载
        init: function() {
            this.loadBrandInfo(this.id);
            this.loadBrandCookie();
            this.bindScroll();
            showFloat.showDownloadGuide();
            gotop.init();

            this.winScroll();
        }
    };
    brand.init();
    // 倒计时方法
    var tick = function(beginTime,endTime){
        var NowTime = new Date().getTime(),
            BeginTime = brand.begin_time,
            EndTime = brand.end_time,
            d = 0,
            h = 0,
            m = 0,
            s = 0.
            t = 0;
            if(BeginTime - NowTime > 0){
                // 明日预告
                t =BeginTime - NowTime;
                d=Math.floor(t/1000/60/60/24);
                if(d.toString().length > 3){
                    d = "...";
                }
                h=Math.floor(t/1000/60/60%24);
                m=Math.floor(t/1000/60%60);
                s=Math.floor(t/1000%60);
            }else{
                // 正常
                t =EndTime - NowTime;
                d=Math.floor(t/1000/60/60/24);
                if(d.toString().length > 3){
                    d = "...";
                }
                h=Math.floor(t/1000/60/60%24);
                m=Math.floor(t/1000/60%60);
                s=Math.floor(t/1000%60);
            }
            $('#brand_tick').find('.day').html(d);
            $('#brand_tick').find('.hour').html(h);
            $('#brand_tick').find('.minute').html(m);
            $('#brand_tick').find('.second').html(s);
             setTimeout(tick,1000); 
    };
    // 列表筛选交互
    $.zheui.bindTouchGoto($("#brand_filter").find('li'), function(o) {
        var class_name = o.attr("class"),
            key = o.attr("data-filter");
        //if (class_name != "on") {
            $("#brand_filter").find('li').removeClass("on");
            o.addClass("on");
            console.log("key is:",key);
                if (key == 'saled') {
                    //o.find('i').removeClass('sales_down').addClass('sales_up');
                    //o.attr('data-filter','sale');
                    brand.order = 'saled';
                    $.tracklog.action("order",track_data,"{eventvalue:saled}");
                }else if(key == 'sale'){
                    //o.find('i').removeClass('sales_up').addClass('sales_down');
                    o.attr('data-filter','saled');
                    brand.order = 'saled';
                    $.tracklog.action("order",track_data,"{eventvalue:saled}");
                }else if(key == 'priced'){
                    o.find('i').removeClass('price_down').addClass('price_up');
                    o.attr('data-filter','price');
                    brand.order = 'price';
                    $.tracklog.action("order",track_data,"{eventvalue:price}");
                }else if(key == 'price'){
                    o.find('i').removeClass('price_up').addClass('price_down');
                    o.attr('data-filter','priced');
                    brand.order = 'priced';
                    $.tracklog.action("order",track_data,"{eventvalue:priced}");
                }else{
                    brand.order = '';
                    $.tracklog.action("order",track_data,"{eventvalue:default}");
                }
            brand.isFresh = true;
            if(brand.isPresell() == 1){
                brand.loadBrandList(1,brand.id, brand.urlName, brand.page);
            }else if(brand.isPresell() == 0){
                brand.loadBrandList(0,brand.id, brand.urlName, brand.page);                
            }
            document.body.scrollTop=0;
            $("#brand_list_items").empty();  
        //}
    });

});