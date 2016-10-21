/*
 * 品牌团
 * */
define(function(require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");

    $.cookie.set("pos_value","brand");
    $.cookie.set("pos_type","brand");
    var track = require("../common/track_v2");
    track.init("m");
    var track_data = {
        pos_type:'brand',
        pos_value:'brand'
    };

    //置顶功能
    var gotop = require("../common/gotop");
    //显示下载浮层
    var showFloat = require('../common/show_float');
    //导航滑动
    var iScroll = require("../common/iscroll");

    var Swipe = require("../common/swipe");


    //品牌团全局变量
    var brand = {};
    brand.nextpage = false;   //默认是否有下一页
    //brand.tag = "today";     //初始化显示的菜单项：今日上线
    brand.isload = false;     //是否在加载中
    brand.page = 1;           //初始化页码
    brand.perPage = 20;       //每页数量
    brand.info = {};          //品牌信息，用于跳转品牌列表


    function saveState(data) {
    	var diff = false;
    	if (history.state) {
    		for (var k in history.state) {
    			if (!(k in data)) {
    				data[k] = history.state[k];
    			} else if (data[k] != history.state[k]) {
    				diff = true;
    			}
    		}
    	} else {
    		diff = true;
    	}
    	if (diff) {
    		history.replaceState(data, '', [location.href]);
    	}
    }
    function restoreState() {
    	var data;
    	if (history.state) {
    		for (var k in history.state) {
    			if (!data) data = {};
    			data[k] = history.state[k] + '';
    		}
    	}
    	return data;
    }

    //用户信息
    var user = {
        userRole: $.cookie.get("user_role") || "",
        userType: $.cookie.get("user_type") || "",
        student: $.cookie.get("student") || ""
    };
    //品牌团全局变量
    var brand = {
        nextpage: false, //默认是否有下一页
        //brand.tag = "today";     //初始化显示的菜单项：今日上线
        isload: false, //是否在加载中
        page: 1, //初始化页码
        perPage: 20, //每页数量
        isWebp: false,//检查浏览器是否符合webp
        info: {}, //品牌信息，用于跳转品牌列表
        //当前分类
        tag: $.cookie.get("c_url_name"),
        tag: this.tag ? this.tag : "today_v2",
        currentNav: $.localData.get("currentNav") ? this.currentNav : "today_v2",
        data_content: '',
        // 过滤大促数组索引
        brandProList:[],
        //tab一级索引，list索引
        tabIndex:$.localData.get("tabIndex"),
        tabIndex: this.tabIndex ? this.tabIndex : 0,
        //tab二级索引
        navIndex:$.localData.get("navIndex"),
        navIndex: this.navIndex ? this.navIndex : 0,        
        //tab一级id
        tabId: $.localData.get("tabId"),
        //tab二级id
        tagId: $.localData.get("tagId"),
        brandList:$("#brand_main_content").find('.item'),
        $navItems:$("#brand_nav_items").find("li"),
        //加载品牌团导航
        loadBrandNav: function() {
            //urlName = urlName ? urlName : "today";
            var _that = this;
            $.ajax({
                type: "GET",
                url: "brand/tab?user_role=" + user.userRole + "&user_type=" + user.userType + "&student=" + user.student,
                dataType: "json",
                success: function(navData) {
                    // console.log("loadBrandNav data:", navData);
                    brand.storeNavData(JSON.stringify(navData));
                    var nav_template = $('#brand_nav_items'),
                        content_template = $('#brand_main_wrap'),
                        scrollWidth = 0;
                    if (navData.objects.length > 0) {
                    	if (navData.objects.length > 0) {
                            for (var i = 0; i < navData.objects.length; i++) {
                                nav_template.append('<li data-content="' + navData.objects[i].data_content + '" data-id="' + navData.objects[i].id + '">' + navData.objects[i].title + '</li>');
                                content_template.append('<div class="item" id="brand_list_items_'+ navData.objects[i].id + '"><ul></ul></div>');
                                $.localData.set('_brandTagData_'+navData.objects[i].id, JSON.stringify(navData.objects[i].categorys));
                            };
                            
                            brand.data_content = navData.objects[0].data_content;
                            
                            //导航左右滑动
                            $(".brand_nav_main li").forEach(function(item) {
                                var $item = $(item);
                                var patrn=/http:/;
                                if(patrn.exec($item.attr("data-content"))){
                                    brand.brandProList.push($item.index());
                                    $(item).addClass("remove").hide();
                                };
                                $(item).attr("data-left",scrollWidth);
                                scrollWidth += $item.width();
                            });
                            // var ProList = brand.brandProList;
                            // for(i=0; i < ProList.length; i++){
                            //     var key = parseInt(ProList[i]);
                            //     console.log(key);
                            //     $("#brand_nav_scroller").find('li').eq(key).remove();
                            // };
                            $("#brand_nav_scroller").find(".remove").remove();
                            scrollWidth += 20;
                            $("#brand_nav_scroller").find('ul').width(scrollWidth);
                            this.scrollObj = new iScroll(brand_nav_scroller, {
                                    snap: false,
                                    momentum: false,
                                    hScrollbar: false,
                                    vScroll:false,
                                    onScrollEnd: function () {}
                            });
                    		//跳转品牌团分类列表
                            function onNavTapped(element) {
                            	var $this = element,
                                    $brandList = $("#brand_list_items_"+brand.tabId+""),
                                    $brandNavItems = $("#brand_nav_items li"),
                                    $loading = $("#loading_init"),
                                    $loadingMore = $(".loading_more"),
                                    $listEnd = $(".list_end"),
                                    tabId = element.attr('data-id'),
                                    data_content = element.attr('data-content'),
                                    key = element.index();
                                     _that.bindTouchEvent($("#brand_nav_items li"), onNavTapped);
                                    brand.data_content = data_content;

                                $.tracklog.action('tab',track_data,'{eventvalue:'+ tabId +',eventtype:1}');
                                if ($this.hasClass("brand_nav_on")) {
                                    return;
                                } else {
                                    var patrn=/http:/; 
                                    $.localData.set('tabId', tabId);
                                    $.localData.set('tagId', '');
                                    $.localData.set('tabIndex', key);
                                    $brandNavItems.removeClass("brand_nav_on");
                                    $this.addClass("brand_nav_on");
                                    $brandList.html("");
                                    $loadingMore.hide();
                                    $listEnd.hide();
                                    $loading.show();
                                    brand.loadNavTag(key);
                                    if(patrn.exec(data_content)){
                                        // $("#loading_init").hide();
                                        // $("#brand_main_content").find('.item').eq(key).empty().append("<iframe width='640' scrolling='yes' height='auto' frameborder='0' allowtransparency='true' src='"+data_content+"'></iframe");
                                    }else{
                                        brand.data_content = data_content;
                                        brand.tag = $this.data("url");
                                        brand.loadNavTag(key);
                                        // brand.loadBrandList(key,tabId, '', 1);  
                                    }
                                }
                            };
                            $('.brand_nav_main').show();
                    		// #108492 在重新进入页面时恢复之前的选中 tab。使用了模拟事件的方式。
                            var state = restoreState();
                            var tagId = $.localData.get("tagId");
                            var tabId = this.tabId;
                            var index = 0;
                            if (state) {
                            	tabId = tabId || state.tabId;
                            	tagId = tagId || state.tagId;
                            	index = state.index || 0;
                            	brand.data_content = state.data_content;

                            	setTimeout(function () {
                            		// 等待0秒，用来完成一级菜单的载入。

									// 模拟执行一级 tab 被触摸。
                            		onNavTapped($('#brand_nav_items li').eq(index));

									// 滚动一级分类，内部会触发一级菜单的切换事件以进行相应的处理
                            		_that.swipeObj.slide(index, 0);

                            		var $tag = $('#brand_tag_items li[data-id="' + tagId + '"]');

									// 如果有选中二级菜单
                            		if ($tag.length) {

                            			// 删除所有的选中项。
                            			$tag.removeClass('brand_tag_on').siblings().removeClass('brand_tag_on');

                            			// 滚动到二级菜单的选中项位置。
                            			if (typeof navScroll === 'object' && navScroll.scrollTo && navScroll.scrollToElement) {
                            				if ('tagScrollLeft' in state) {
                            					navScroll.scrollTo(parseInt(state.tagScrollLeft) || 0, 0, 0);
                            				} else {
                            					navScroll.scrollToElement($tag[0], 0);
                            				}
                            			}

                            			// 触发二级菜单被触摸事件
                            			$tag.trigger('touchend');
                            		}
                            	}, 0);

                            } else {
                            	brand.loadNavTag(0);
                            	$('#brand_nav_items').find('li').eq(0).addClass("brand_nav_on");
                            	brand.data_content = $("#brand_nav_items").find("li").eq(0).attr("data-content");
                            	_that.loadBrandList(index, tabId, tagId, this.page);
                            }
                            
                        }else{
                        }
                        brand.tabFn();
                        brand.tabSort();
                    } else {
                        $('.brand_nav_main').hide();
                    }

                },
                timeout: 20000,
                error: function() {
                    $(".loading").html("网络异常，请稍候再试");
                }
            });
        },
        navCur: function(ind) {
          var curObj = $("#brand_nav_items").find("li").eq(ind),_this = this,
              temp =$(".brand_nav_items").width() - $(".brand_nav_scroller").width(),
              obj = JSON.parse($.localData.get('_brandNavData')).objects,
              tagId =  "";
                if(obj[ind].categorys[0]){
                    tagId = obj[ind].categorys[0].id
                }
          $("#brand_nav_items").find("li").removeClass("brand_nav_on");
          $.localData.set('tabIndex', ind);
          curObj.addClass("brand_nav_on");
          brand.loadNavTag(ind);
            if (ind>=0 && temp > 0) {
              if (ind ==1 || ind==0 ) {
                var left = 0;
              }else{
                 var left = curObj.prev().attr("data-left");
              }
              if (left >= temp) {
                left = temp;
              }
              $("#brand_nav_items").animate({"-webkit-transform":"translate("+(-1)*left+"px, 0px) scale(1) translateZ(0px)"},200);
              document.body.scrollTop=0;
            }
        },
        loadNavTag: function(key) {
            console.log("loadNavTag method start");
            var id = $("#brand_nav_items").find("li").eq(key).attr("data-id");
            var data_content = $("#brand_nav_items").find("li").eq(key).attr("data-content");
            var obj = JSON.parse($.localData.get('_brandTagData_'+id));
            console.log("loadNavTag",obj);
            // console.log("loadNavTag id",id);
            if (obj.length > 0) {
                $('#brand_tag_items').empty();
                if(obj.length == 1){
                    $('#brand_tag_items').empty();
                    $('.brand_tag_main').hide();
                }else{
                    for (var i = 0; i < obj.length; i++) {
                        $('#brand_tag_items').append('<li data-id="' + obj[i].id + '" data-url="' + obj[i].url_name + '"><span class="icon_tag"><img src="' + obj[i].pic + '" width="40" height="40"></span><span class="title"><i>' + obj[i].name + '</i></span></li>');
                    };
                    $('.brand_tag_main').show(); 
                }
                var tagId = obj[0].id;
                console.log("loadNavTag tagId",tagId);
                $.localData.set('tagId', tagId);
                // console.log("loadNavTag data_content",data_content)
                brand.data_content = data_content;
                brand.bindTouchEvent($("#brand_tag_items li"), function(element) {
                    var $this = element,
                        $brandTagItems = $("#brand_tag_items").find('li'),
                        key = element.index(),
                        tabIndex = $.localData.get('tabIndex');
                        tagId = element.attr('data-id');
                    // alert(urlname);
                    $.tracklog.action('tab',track_data,'{eventvalue:'+ tagId + ',eventtype:2}');
                    if ($this.hasClass("brand_tag_on")) {
                        return void 0;
                    } else {
                        $.localData.set('tagId', tagId);
                        $.localData.set('tagIndex', key);

                        $brandTagItems.removeClass("brand_tag_on");
                        $this.addClass("brand_tag_on");
                        brand.loadBrandList(tabIndex,brand.tabId,tagId,1);
                    }
                });
                $('#brand_tag_items').find('li').eq(0).addClass("brand_tag_on");
                var scrollWidth = 0;
                //导航左右滑动
                $("#brand_tag_items li").forEach(function(item) {
                    var $item = $(item);
                    $(item).attr("data-left",scrollWidth);
                    scrollWidth += $item.width();
                });
                scrollWidth += 20;

                $("#brand_tag_scroller").find('ul').width(scrollWidth);
                navScroll = new iScroll('brand_tag_scroller', {
                    //snap: true,
                    //momentum: false,
                    hScrollbar: false,
                    vScroll:false,
                    onScrollEnd: function() {}
                });
                scrollToElement = $('li');

            }else if(obj.length  == 0){
                $.localData.set('tagId', "");
               $('.brand_tag_main').hide(); 
            }else{
                $.localData.set('tagId', "");
               $('.brand_tag_main').hide(); 
            }
        },
        loadBrandList: function (index, tabId, tagId, page) {

        	// #108492 在每次载入数据时，记录菜单状态。
        	var state = { index: index, tabId: tabId, tagId: tagId, data_content: brand.data_content };
        	// 记录二级菜单滚动位置。
        	if (typeof navScroll === 'object' && navScroll.x !== undefined) {
        		state.tagScrollLeft = navScroll.x;
        	}
        	saveState(state);


            this.isload = false;
            index = index || '';
            tabId = tabId || '';
            tagId = $.localData.get("tagId");
            page = page || 1;
            var _this = this;
            this.page = page;
            // console.log("loadBrandList data_content",brand.data_content);
            // console.log("loadBrandList tag_id",brand.tagId);
            // if (tagId == '') {
            //     var url = "brand/brandlist?user_role=" + user.userRole + "&t_dim=" + brand.data_content + "&user_type=" + user.userType + "&student=" + user.student + "&per_page=" + brand.perPage + "&page=" + page + "&url_name=&tabId=" + tabId + "&image_model=jpg";
            // } else {
            if(this.isWebp){
                var url = "brand/brandlist?user_role=" + user.userRole + "&t_dim=" + brand.data_content + "&user_type=" + user.userType + "&student=" + user.student + "&per_page=" + brand.perPage + "&page=" + page + "&url_name=" + tagId + "&tabId=" + tabId + "&image_model=webp";
            }else{
                var url = "brand/brandlist?user_role=" + user.userRole + "&t_dim=" + brand.data_content + "&user_type=" + user.userType + "&student=" + user.student + "&per_page=" + brand.perPage + "&page=" + page + "&url_name=" + tagId + "&tabId=" + tabId + "&image_model=jpg";
            };
            // var url = "brand/brandlist?user_role=" + user.userRole + "&t_dim=" + brand.data_content + "&user_type=" + user.userType + "&student=" + user.student + "&per_page=" + brand.perPage + "&page=" + page + "&url_name=" + tagId + "&tabId=" + tabId + "&image_model=jpg";

            // }
            var key = index;
            var pages = page;
            $("#loading_init").show();
            if(pages == 1){
               $("#brand_main_content").find('.item').eq(key).empty();
            }
            $.ajax({
                type: "GET",
                url: url,
                dataType: "json",
                success: function(data) {
                    console.log("loadBrandList data", data);
                    brand.isload = true;
                    brand.nextpage = data.meta.has_next;
                    $.localData.set('tabIndex', key);
                    var brandListItems = data.objects,
                        html = "";

                    var imgWidth = $("#ct")[0].offsetWidth;

                	// #108964 重新定义品牌团元素高度，之前是 170，是一个错误的值。
                    var imageRate = .4, itemMargin = 10;
                    var itemHeight = Math.ceil(imgWidth * imageRate) + 43, endLineHeight = 0, loadingHeight = 290;

                        // patrn=/http:/,
                        // data_content = brand.data_content.replace("app","m");
                        if(brandListItems.length > 0){
                        	var tpl = '<li class="brand_list" data-id="#BRAND_ID#" style="height: ' + (itemHeight - itemMargin) + 'px">' +
                                '<time class="#BRAND_TIME_TAG#">#BRAND_TIME#</time>' +
                                '<figure ><img style="height:' + Math.ceil(imgWidth * imageRate) + 'px;" src="//i0.tuanimg.com/ms/zhe800m/dist/img/img_120_80.png" data-url="#BRAND_IMG#"><h3>#BRAND_RULE#</h3></figure>' +     //根据屏幕分辨率设置预加载图片的高度
                                '<aside>' +
                                '<figure><p>#BRAND_TITLE#</p>' +
                                '</figure>' +
                                '<div class="r">￥#BRNAD_LOW#起</div>' +
                                '</aside>' +
                                '</li>',
                            $brandList = $("#brand_main_content").find('.item').eq(key),
                            $brandListItems = null,
                            $loading = $("#loading_init"),
                            $loadingMore = $(".loading_more"),
                            $listEnd = $(".list_end");

                            // alert(tabId);
                            $brandItemHeight = $("#brand_list_items_"+tabId).height();
                            if (!brandListItems || brandListItems.length === 0) {
                                $loading.hide();
                                //$("#brand_main_content").find('.item').eq(0).empty().append('<div class="not_data"><i></i>暂无符合条件的数据</div>');
                                return;
                            }
                            // alert($("#brand_list_items_189").height());
                            brandListItems.forEach(function(brandItem) {

                                var endTime, beginTime ,nowTime, days, hours, minute, time, forestHour,today,time_tag,endTimeOrign,endTimeOrignP,nowTimeCount,forestTimeCount;
                                nowTime = new Date().getTime();
                                beginTime  = brandItem.begin_time.replace(/-/g, "/");
                                beginTime = new Date(beginTime).getTime();
                                endTime = brandItem.end_time.replace(/-/g, "/");
                                endTime = new Date(endTime).getTime();

                                nowTimeCount = new Date().toString().split(" ")[4].split(":")[0];
                                forestTimeCount = brandItem.begin_time.toString().split(" ")[1].split(":")[0];
                                endTimeOrign = parseInt(brandItem.begin_time,10);
                                endTimeOrignP = new Date(endTimeOrign);
                                forestHour = endTimeOrignP.toString().split(" ")[4].split(":")[0];

                                // console.log(forestHour);
                                if(brand.data_content == 'tomorrow_v2'){
                                    days = (beginTime - nowTime) / 1000 / 60 / 60 / 24;
                                    days = Math.floor(days);
                                    hours = (beginTime - nowTime) / 1000 / 60 / 60;
                                    hours = Math.floor(hours);
                                    minute = (beginTime - nowTime) / 1000 / 60;
                                    minute = Math.floor(minute);
                                    today = brandItem.today;
                                }else{
                                    days = (endTime - nowTime) / 1000 / 60 / 60 / 24;
                                    days = Math.floor(days);
                                    hours = (endTime - nowTime) / 1000 / 60 / 60;
                                    hours = Math.floor(hours);
                                    minute = (endTime - nowTime) / 1000 / 60;
                                    minute = Math.floor(minute);
                                    today = brandItem.today;
                                }
                                if(today == 1){
                                    if(brand.data_content == 'tomorrow_v2'){
                                        time = "今日" + forestHour + "点开卖";
                                        time_tag="sold";  
                                    }else{
                                      time = "今日上新";
                                      time_tag="today";  
                                    }
                                }else{
                                    if(days == 0 && brand.data_content == 'tomorrow_v2'){
                                        time = "明日" + forestTimeCount + "点开卖";
                                        time_tag="sold"; 
                                    }else if (days > 0) {
                                        if(brand.data_content == 'tomorrow_v2' && days> 1 && days <2){

                                            time = "明日" + forestHour + "点开卖";
                                            time_tag="sold";  
                                        }else if(brand.data_content == 'tomorrow_v2' && days> 2 && days <3){
                                            time = "后天" + forestHour + "点开卖";
                                            time_tag = "sold";  
                                        }else if(brand.data_content == 'tomorrow_v2' && days >3){
                                            time = "即将开卖";
                                            time_tag = "sold";  
                                        }else{
                                            time = "剩" + days + "天";
                                            time_tag = "sold";  
                                        }
                                    }else if (hours > 0) {
                                        time = "剩" + hours + "小时";
                                        time_tag = "sold";
                                    } else if (minute > 0) {
                                        time ="剩" +  minute + "分";
                                        time_tag = "sold";
                                    } else if (minute > 0) {
                                        time = "即将下架";
                                        time_tag = "soldOut";
                                    }else{
                                        time = "正在热抢";
                                       time_tag = "sold"; 
                                    }
                                }
                                html += tpl.replace("#BRAND_ID#", brandItem.id)
                                    .replace("#BRAND_TIME_TAG#", time_tag)
                                    .replace("#BRAND_TIME#", time)
                                    .replace("#BRAND_IMG#", brandItem.brand_image_url.big)
                                    .replace("#BRAND_RULE#", brandItem.discount_rule.join(" "))
                                    .replace("#BRAND_LOGO#", brandItem.logo_image)
                                    .replace("#BRAND_TITLE#", brandItem.special_name ? brandItem.special_name : brandItem.special_name)
                                    // .replace("#BRAND_DC#", brandItem.discount)
                                    .replace("#BRNAD_LOW#", brandItem.low_price / 100);

                                brand.info["ID" + brandItem.id] = {
                                    time: time, //剩余时间
                                    rule: brandItem.discount_rule.join(" "), //打折规则
                                    logo: brandItem.logo_image, //logo
                                    name: brandItem.name, //品牌名称
                                    title: brandItem.title, //品牌标题
                                    discount: brandItem.discount, //品牌最低打折
                                    low: brandItem.low_price / 100 //品牌最低价
                                };
                            });
                            $loading.hide();
                            brand.page = pages;
                            if(pages > 1){
                                // $brandList.height($brandItemHeight);
                              $("#brand_main_content").find('.item').eq(key).append(html);
                            }else{
                                //$brandList.height($brandItemHeight);
                                $brandList.empty().append(html);
                            }
                            if($("#brand_main_content").find('.item').eq(key)){
                                var tabId = $("#brand_nav_scroller").find("li").eq(key).attr("data-id"),
                                    height = parseInt($("#brand_list_items_"+tabId).attr("data-height"))+30+"px";
                                    console.log($("#brand_main_content").find('.item').eq(key).find('li').length);
                                if($("#brand_main_content").find('.item').eq(key).find('li').length == 0){
                                   $("#brand_main_content").find('.item').eq(key).attr("data-height",300+"px"); 
                                    // if (height!= $("#brand_main_wrap").height()) {
                                    $("#brand_main_wrap").css("height",230+"px");
                                    // }
                                }else{
                                    if(brand.page > 1){
                                    	var height = $("#brand_main_content").find('.item').eq(key).find('li').length * itemHeight + loadingHeight + "px";
                                    }else{
                                    	var height = $("#brand_main_content").find('.item').eq(key).find('li').length * itemHeight + endLineHeight + "px";
                                    };
                                    if (height!= $("#brand_main_wrap").height()) {
                                        $("#brand_main_wrap").css("height",height);
                                    }
                               }
                            };
                        }else{
                            if($("#brand_main_content").find('.item').eq(key)){
                                var tabId = $("#brand_nav_scroller").find("li").eq(key).attr("data-id"),
                                    height = parseInt($("#brand_list_items_"+tabId).attr("data-height"))+30+"px";
                                console.log(height);
                                    console.log($("#brand_main_content").find('.item').eq(key).find('li').length);
                                if($("#brand_main_content").find('.item').eq(key).find('li').length == 0){
                                   $("#brand_main_content").find('.item').eq(key).attr("data-height",300+"px"); 
                                    // if (height!= $("#brand_main_wrap").height()) {
                                        $("#brand_main_wrap").css("height",230+"px");
                                    // }
                               }else{
                                    if(brand.page > 1){
                                    	var height = $("#brand_main_content").find('.item').eq(key).find('li').length * itemHeight + loadingHeight + "px";
                                    }else{
                                    	var height = $("#brand_main_content").find('.item').eq(key).find('li').length * itemHeight + endLineHeight + "px";
                                    };                                    
                                    if (height!= $("#brand_main_wrap").height()) {
                                        $("#brand_main_wrap").css("height",height);
                                    }
                               }
                            };
                            if(data.meta.has_next == false && pages >1){
                                $("#loading_init").hide();
                                $(".loading_more").hide();
                                // $("#brand_main_wrap").css("height",$("#brand_main_wrap").height()+100+"px");
                                $(".list_end").show();
                                return;
                            }else{
                                $("#loading_init").hide();
                                $(".loading_more").hide();
                                $("#brand_main_content").find('.item').eq(key).empty().append('<div class="not_data"><i></i>暂无符合条件的数据</div>');
                                $(".list_end").hide();
                            }
                        }


                        if($("#brand_main_content").find('.item').eq(key)){
                            var tabId = $("#brand_nav_scroller").find("li").eq(key).attr("data-id"),
                                height = parseInt($("#brand_list_items_"+tabId).attr("data-height"))+30+"px";
                                // console.log($("#brand_main_content").find('.item').eq(key).find('li').length);
                            if($("#brand_main_content").find('.item').eq(key).find('li').length == 0){
                               $("#brand_main_content").find('.item').eq(key).attr("data-height",300+"px"); 
                                // if (height!= $("#brand_main_wrap").height()) {
                                $("#brand_main_wrap").css("height",230+"px");
                                // }
                           }else{
                            	var height = $("#brand_main_content").find('.item').eq(key).find('li').length * itemHeight + endLineHeight + "px";
                                //console.log( $("#brand_main_wrap").height(),height)
                                if (height!= $("#brand_main_wrap").height()) {
                                    $("#brand_main_wrap").css("height",height);
                                }
                           }
                        };
                        //跳转品牌团商品列表页
                        if($brandList){
                            $brandListItems = $brandList.find("li");
                            _this.bindTouchEvent($brandListItems, function(element) {
                                var brandId = element.data("id"),
                                    info = encodeURIComponent(JSON.stringify(brand.info["ID" + brandId])),
                                    tag = brand.tag;

                                //if (tag === "yesterday" || tag === "today" || tag === "last") { //昨日上线 今日上线 最后疯狂
                                //tag = "all";
                                //}

                                //console.log("品牌ID：" + brandId);
                                /*window.location.href = "/app/brand/brand_list.html?url_name=" + tag + "&brand_id=" +
                                    brandId + "&brand_info=" + info;*/
                                window.location.href = "/m/brand/list?url_name=" + tag + "&brand_id=" +
                                    brandId + "&brand_info=" + info;
                            });
                            $brandList.imglazyload({
                                "imgattr": "data-url"
                            });
                            if (brand.nextpage) {
                                $loadingMore.show();
                            } else {
                                $loadingMore.hide();
                                //var multiple = 0,
                                //    extendHeight = 0,
                                //    screenHeight = window.screen.height;
                                //// alert(screenHeight);
                                //// alert($("#brand_main_content").find('.item').eq(key).find('li').length);
                                //if ($("#brand_main_content").find('.item').eq(key).find('li').length > 0 && $("#brand_main_content").find('.item').eq(key).find('li').length < 5) {
                                //    extendHeight = -5;
                                //}else if($("#brand_main_content").find('.item').eq(key).find('li').length > 5 && $("#brand_main_content").find('.item').eq(key).find('li').length <= 20){
                                //    if(screenHeight < 580){
                                //        multiple = -5;
                                //    }else{
                                //        multiple = 5.35;
                                //    }
                                //    extendHeight = $("#brand_main_content").find('.item').eq(key).find('li').length * multiple;
                                //}else if($("#brand_main_content").find('.item').eq(key).find('li').length > 20 && $("#brand_main_content").find('.item').eq(key).find('li').length < 30){
                                //    if(screenHeight < 580){
                                //        multiple = 2;
                                //    }else{
                                //        multiple = 5.8;
                                //    }
                                //    extendHeight = $("#brand_main_content").find('.item').eq(key).find('li').length * multiple;
                                //}else if($("#brand_main_content").find('.item').eq(key).find('li').length > 30 && $("#brand_main_content").find('.item').eq(key).find('li').length < 40){
                                //    if(screenHeight < 580){
                                //        multiple = 3;
                                //    }else{
                                //        multiple = 6.3;
                                //    }
                                //    extendHeight = $("#brand_main_content").find('.item').eq(key).find('li').length * multiple;
                                //}else if($("#brand_main_content").find('.item').eq(key).find('li').length > 40 && $("#brand_main_content").find('.item').eq(key).find('li').length < 80){
                                //    if(screenHeight < 580){
                                //        multiple = 4;
                                //    }else{
                                //        multiple = 7.8;
                                //    }
                                //    extendHeight = $("#brand_main_content").find('.item').eq(key).find('li').length * multiple;
                                //}else if($("#brand_main_content").find('.item').eq(key).find('li').length > 80 && $("#brand_main_content").find('.item').eq(key).find('li').length < 100){
                                //    multiple = 8;
                                //    extendHeight = $("#brand_main_content").find('.item').eq(key).find('li').length * multiple;
                                //}
                                //// alert("extendHeight",extendHeight);
                                //$("#brand_main_wrap").css("height",$("#brand_main_wrap").height()+extendHeight+"px");
                                $listEnd.show();
                            };
                        }  
                    
                },
                timeout: 20000,
                error: function() {
                    $("#brand_main_content").find('.item').eq(key).empty();
                    $(".loading").html("网络异常，请稍候再试");

                }
            });
        },
        storeNavData: function(data) {
            $.localData.set('_brandNavData', data);
        },
        /**
         * 绑定touch事件，消除冒泡阻塞
         */
        bindTouchEvent: function ($els, callback) {
            var isMove;
            $els.each(function (index, ele) {
                $(ele).bind({
                    "touchstart": function (e) {
                        touch_startX = e.touches[0].pageX;
                        touch_startY = e.touches[0].pageY;
                        isMove = false;
                    },
                    "touchmove": function (e) {
                        touch_moveEndX = e.touches[0].pageX;
                        touch_moveEndY = e.touches[0].pageY;
                        touch_X = touch_moveEndX - touch_startX;
                        touch_Y = touch_moveEndY - touch_startY;
                        if (Math.abs(touch_X) >= 3 || Math.abs(touch_Y) >= 3) {
                            isMove = true;
                        }
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
        },
        tabSort:function(){
            var key = $('#brand_nav_items').find('li').length;
                tagKey = $('#brand_tag_items').find('li').length;
            if (key > 5) {
                // $('#brand_nav_wrapper').find('.lMask').show();
                $('#brand_nav_wrapper').find('.rMask').show();
            };
            if (tagKey > 5) {
                // $('#brand_tag_wrapper').find('.lMask').show();
                $('#brand_tag_wrapper').find('.rMask').show();                
            };
        },
        tabFn: function () {
          var _this = this;
            $navItems = $('#brand_nav_items').find('li');
            function proList(){
                // var arr = brand.brandProList;
                // Array.prototype.baoremove = function(dx)
                //               {
                //                 if(isNaN(dx)||dx>this.length){return false;}
                //                 this.splice(dx,1);
                // };
                // console.log(brand.brandProList);
                for (var i = 0; i < brand.brandProList.length; i++) {
                    $("#brand_main_content").find(".item").eq(brand.brandProList[i]).addClass("remove");
                }
                $("#brand_main_content").find(".remove").remove();
                brand.brandProList=[];
                console.log(brand.brandProList);
                // if(brand.brandProList){
                //     if(brand.brandProList.length == 1){
                //         var key = brand.brandProList[0];
                //         $('#brand_main_content').find(".item").eq(key).remove();
                //         brand.brandProList = [];
                //         return void 0;
                //     }else if(brand.brandProList.length > 1){
                //         var key = brand.brandProList[0];
                //         $('#brand_main_content').find(".item").eq(key).remove();
                //         //delete arr[0];
                //         brand.brandProList.baoremove(0);
                //         // console.log(arrB);
                //         // brand.brandProList = arrB; 
                //         proList();
                //     }else{
                //         return void 0;
                //     }
                // }
            }
            proList();

          //手势切换
          this.swipeObj = Swipe($('#brand_main_content').get(0), {
            startSlide: 0,
            continuous: false,
            disableScroll: false,
            stopPropagation: false,
            callback: function(index,element){
                _this.navCur(index);
                var tabId = $('#brand_nav_items').find('li').eq(index).attr('data-id'),
                    data_content = $('#brand_nav_items').find('li').eq(index).attr('data-content'),
                    // data_content = $('#brand_nav_items').find('li').eq(index).attr('data-content').replace("app","m"),
                    // patrn=/http:/,
                    obj = JSON.parse($.localData.get('_brandTagData_' + tabId)),
                    tagId = '';
                    if(obj){
                        // console.log(obj);
                        // tagId = obj[0].id;
                    }
                // if(patrn.exec(data_content)){
                //     // $("#loading_init").hide();
                //     // $("#brand_main_content").find('.item').eq(index).empty().append("<iframe width='640' scrolling='yes' height='auto' frameborder='0' allowtransparency='true' src='"+data_content+"'></iframe");
                //     // brand.tabFn();
                //     return void 0;
                // }else{
                    brand.loadNavTag(index);
                    // console.log("swipeObj",data_content);
                    brand.data_content = data_content;
                    brand.loadBrandList(index,tabId,tagId,1);
                    document.body.scrollTop=0;  
                // } 
            },
            transitionEnd: function(index, element) {
                // alert($("#brand_main_content").find('.item').eq(index).height());
            }
          });
          this.bindTouchEvent($navItems, function(obj,index) {
            _this.swipeObj.slide(index,500);
          });
        },
        bindScroll: function() {
            //绑定加载下一页事件
            $(window).bind("scroll", function() {
                var wh = window.innerHeight;
                var sctop = document.body.scrollTop;
                var pageh = $("#ct").height();
                if ((wh + sctop + 20) >= pageh) {
                    if (brand.nextpage && brand.isload) {
                        if ($(".loading_more").length == 0) {
                            var html = '<div class="loading_more"><span class="loading"><i class="icon_load"></i>加载中......</span></div>';
                            $(".brand_main").append(html);
                        } else {
                            $(".loading_more").html('<span class="loading"><i class="icon_load"></i>加载中......</span>').show();
                        }
                        var nextPage = brand.page + 1;
                        var tabIndex = $.localData.get('tabIndex');
                        brand.loadBrandList(tabIndex,brand.tabId,brand.tagId, nextPage);
                    }
                }
            });
        },
        winScroll: function() {
            var topNum = this.$navWrap.offset().top,
                _this = this;
            $(window).bind("scroll", function() {
                var scrollTop = $(window).scrollTop(),
                    conH = $("#ct").height();
                //导航固定
                if (topNum <= scrollTop) {
                    _this.$navWrap.addClass("fixed");
                } else {
                    _this.$navWrap.removeClass("fixed");;
                }
            })
        },
        init: function() {
            $.cookie.remove("c_url_name");
            $.localData.set('navIndex',0);
            $.localData.set('tagIndex',0);
            if($.os.android){this.isWebp = true;}
            this.winH = window.innerHeight;
            this.$navWrap = $(".brand_nav_main");
            this.startTime = new Date().getTime();
            this.bindScroll();
            gotop.init();
            showFloat.showDownloadGuide();
            this.loadBrandNav(); 
            this.winScroll();
        }
    };

    brand.init();

});