/**
 * 推广页js
 * @date    2015-05-27 14:57:36
 */
define(function(require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");
    require("../common/track");

    //置顶功能
    var gotop = require("../common/gotop");
    gotop.init();

    //引入曝光统计
    var exposure = require("../common/exposure");

    //显示下载浮层
    //var showFloat = require('../common/showFloat');
    //showFloat.showFloat();
    //showFloat.closeOtherFloat();
    var showFloat = require('../common/show_float');
    showFloat.showDownloadGuide();

    //推广页全局变量
    var tg = {};
    tg.nextpage = false;   //默认是否有下一页
    tg.isload = false;     //是否在加载中
    tg.page = 1;           //初始化页码
    tg.perPage = 20;       //每页数量
    tg.data = {};          //全局数据

    tg.data.key = $.zheui.getUrlKeyVal("key"); //搜索关键字

    //页面初始化
    loadTgList(1);

    function loadTgList(o){
    	tg.isload = false;
    	tg.page = o;
    	$.ajax({
    		type:"GET",
    		url :"/m/api/getdealsbybusinessconfig?keywords="+tg.data.key+"&page="+tg.page+"&per_page="+tg.perPage,
    		dataType: "json",
    		success:function(data){
    			tg.isload = true;
    			if(typeof data =="object"){
    				var _data = data.objects;
    				if(_data){
    					tg.nextpage = data.meta.has_next;
                        var load_img = "//i0.tuanimg.com/ms/zhe800wx/dist/img/img_placehd.png",
                            htmlStr = '<ul class="tg-list" id="tg-list_'+o+'">',
                            htmlItemTpl = '<li data-id ="#DEALID#">'+
                                            '<a href="#DEAL_URL#">'+
                                            '<span class="#SHOP_TYPE#"></span>'+
                                            '<img src="//i0.tuanimg.com/ms/zhe800m/dist/img/img_151_170.jpg" data-url="#ITEM_IMAGE#">'+
                                            '<div class="price_line"><span class="pprice">￥#NEW_PRICE#</span><del>￥#OLD_PRICE#</del></div>'+
                                            '<div class="dis_line">'+
                                              '<span class="postage">#BAOYOU#</span>'+
                                              '<span class="sales">#SALES#</span>'+
                                              '<span class="zhekou">#ZHEKOU#折</span>'+
                                            '</div>'+
                                            '<div class="item_tt"><span>#ITEM_TITLE#</span></div>'+
                                            '</a>'+
                                           '</li>',
                            htmlItemStr = '',
                            $tgListMain = $(".tg-list-main");

                            _data.forEach(function(item){
                                htmlItemStr += htmlItemTpl.replace("#DEALID#",item.id)
                                                          .replace("#DEAL_URL#",(item.source_type == 1)?$.tracklog.outUrl($.zheui.domain + "/m/detail/detail?id=" + item.id) : $.tracklog.outUrl(item.wap_url))
                                                          .replace("#SHOP_TYPE#",(item.source_type == 1)?'icon temai':(item.shop_type=0)?'icon taobao':'icon tmall')
                                                          .replace("#ITEM_IMAGE#",item.image_url.hd5)
                                                          .replace("#NEW_PRICE#",item.price / 100)
                                                          .replace("#OLD_PRICE#", item.list_price / 100)
                                                          .replace("#BAOYOU#",item.baoyou ? "包邮" : "")
                                                          .replace("#SALES#","已售" + item.sales_count)
                                                          .replace("#ZHEKOU#", (item.price / item.list_price *10 ).toFixed(1))
                                                          .replace("#ITEM_TITLE#",item.short_title);

                            });
                            htmlStr += htmlItemStr + '</ul>';

                            $tgListMain.append(htmlStr);
                            $("#loading").hide();
                            if(tg.nextpage){
                                $(".loading_more").show();
                            }else{
                                $(".loading_more").hide();
                                $("#ct").append("<div class='list_end'><span></span></div>");
                            }
                            // 图片懒加载
                            $(".tg-list").imglazyload({"imgattr": "data-url"});
                            // 曝光处理
                            exposure.exposure_ev($(".tg-list-main > ul"),"li");
    				}else{
                        $("#loading").text("没有找到符合的商品");
                    }
    			}
    		},
            timeout:20000,
            error:function(){
                if(o==1){
                    $("#loading").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading"), function() {
                        $("#loading").html("<span class=\"icon\"></span><span class=\"txt\">努力加载中...</span>");
                        m_list.init(1);
                    });
                }else{
                    $(".loading_more").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($(".loading_more"), function() {
                        m_list.init(o);
                        $(".loading_more").html("<span class=\"loading\"><i class=\"icon_load\"></i>加载中......</span>");
                    });
                }
            }
    	});
    }
    //绑定加载下一页事件
    $(window).bind("scroll", function() {
        var wh = window.innerHeight;
        var sctop = document.body.scrollTop;
        var pageh = $("#ct").height();
        if ((wh + sctop + 20) >= pageh) {
            if (tg.nextpage && tg.isload) {
                $(".loading_more").html("<span class=\"loading\"><i class=\"icon_load\"></i>加载中......</span>").show();
                var next_page = tg.page + 1;
                loadTgList(next_page);
            }
        }
    });

    //返回首页
    $.zheui.bindTouchGoto($(".btn_tohome"),function(obj){
        window.location.href = "//m.zhe800.com";
    });

});
