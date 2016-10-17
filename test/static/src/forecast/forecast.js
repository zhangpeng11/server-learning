/**
 * 精品预告专用js
 */
define(function(require,exports,module){
	var $=require("zepto");
	require("../common/base");
	require("../common/imglazyload");

	//显示下载浮层
    //var showFloat = require('../common/showFloat');
    //showFloat.showFloat();
    //showFloat.closeOtherFloat();
    var showFloat = require('../common/show_float');
    showFloat.showDownloadGuide();

    //引入曝光统计
    var exposure = require("../common/exposure");
	   var m_list={};
	   m_list.next_page=false;  //默认是否下一页

    //回退按钮
    $.zheui.bindTouchGoto($(".btn_back"),function(){
        window.history.back();
    });

       //列表页数据展示
	   m_list.init=function(o){
	        m_list.isload = false; 
			$.ajax({
				 type:"GET",
				 url:'/v2/forecast/deals?page='+o+'&per_page=20',
				 dataType:"json",
				 success:function(data){
				    var objects=data.objects;
					if(objects.length>0){
						m_list.isload = true;      //是否正在加载中
						m_list.page = o;   //当前第几页
						$("#loading").hide();
						$(".loading_more").hide();
						m_list.nextpage = data.meta.has_next; 
						var htmlstr='<ul class="list" id="list_'+o+'">';
						var load_img="http://i0.tuanimg.com/ms/zhe800wx/dist/img/img_placehd.png";
						for(var i=0;i<objects.length;i++){
							var shop_type=objects[i].shop_type;
                            var source_type=objects[i].source_type;
                            var deal_type=objects[i].deal_type;
                            var today=objects[i].today;
							var price=objects[i].price/100;
							var list_price=objects[i].list_price/100;
							var title=objects[i].title;
							var zheko=(price/list_price*10).toFixed(1);
                            var begin_time = objects[i].begin_time;     //开始时间

							htmlstr+='<li data-id="'+objects[i].id+'"><div class="img">';
						    htmlstr+= "<img src=\"" + load_img + "\" data-url=\"" + objects[i].image_url.hd2+ "\" alt=\"\">";
							if (deal_type == 3) {
                                //优品汇
                                htmlstr += '<span class="icon yph"></span>';
                            }
                            else if (today == 1) {
                                //优品汇
                                htmlstr += '<span class="icon jrsx"></span>';
                            }
                            htmlstr+='<span class="time">'+begin_time+'开抢</span>';
							htmlstr+='</div><div class="attr">';
							htmlstr+='<span class="price">￥'+price+'</span>';
							htmlstr+='<del>￥'+list_price+'</del>';
                            if (source_type == 1) {
                                htmlstr += '<span class="discount">特卖商城</span>';
                            } else {
                                if(shop_type == 0){
                                    htmlstr += '<span class="discount">特卖商城</span>';
                                }
                                if(shop_type == 1){
                                    htmlstr += '<span class="discount">去天猫</span>';
                                }
                            }
							htmlstr+='<h3 class="title">'+title+'</h3>';
							htmlstr+='</div></li>';
						}
                        htmlstr+='</ul>';
						$(".list_main").append(htmlstr);
                        $(".time").show();
/*						if(m_list.nextpage){
							$(".loading_more").html("点击加载更多>>").show();
						}else{
						    $(".loading_more").addClass("no_more").html("没有更多了").show();
						}*/
                        if(!m_list.nextpage){
                            $(".loading_more").addClass("no_more").html("没有更多了").show();
                        }
						$(".list").imglazyload({"imgattr": "data-url"});
                        //曝光统计
                        exposure.exposure_ev($(".list"),"li");
						
						 //绑定方法
						var list_li = $("#list_" + o).find("li");
						$.zheui.bindTouchGoto(list_li, function (obj) {
						    console.log("f");
							$(".dialog").show();
							$.zheui.bindTouchGoto($(".close"),function(obj){
								var _this = obj;
								$(".dialog").hide();
							});
							$.zheui.bindTouchGoto($(".btn"),function(obj){
								var _this = obj;
								$(".dialog").hide();
                                if(getos()=="iphone"||getos()=="ipad"){
                                    window.location.href= "http://w.tuan800.com/dl/app/recommend/redirect?from=guanwang&app=tao800&url=itunes.apple.com/cn/app/tao800-jing-xuan-du-jia-you-hui/id502804922?mt=8";
                                }else{
                                    window.location.href= "http://d.tuan800.com/dl/Zhe800_wap.apk";
                                }
							});
						});

                        //判断手机系统
                        function getos(){
                            if((/android/gi).test(navigator.appVersion)){
                                return "android";
                            }else if((/iphone/gi).test(navigator.appVersion)){
                                return "iphone";
                            }else if((/ipad/gi).test(navigator.appVersion)){
                                return "ipad";
                            }else{
                                return "other";
                            }
                        }
					} else{
                        $("#loading").html("<span class='no_list_mes'></span>").show();
                    }
				 },
				 timeout:20000,
				 error:function(){
					 	if(o == 1){
							//第一页加载失败处理
							$("#loading").text("加载失败，点击重新加载");
							$.zheui.bindTouchGoto($("#loading"),function(){
								$("#loading").html("<span class=\"icon_load\"></span><span class=\"txt\">努力加载中...</span>");
								m_list.init(1);
							});
						}else{
							//后面页加载失败处理
							$(".loading_more").html("<span class=\"load_fail\">加载失败，点击重新加载</span>");
							$.zheui.bindTouchGoto($(".loading_more"),function(){
								m_list.init(o);
								$(".loading_more").html("<span class=\"load\"><i class=\"icon_load\"></i>加载中......</span>");
							});
						}
				 }
		    });
	   };
	m_list.init(1);

    //绑定加载下一页事件
    $(window).bind("scroll",function(){
        var wh = window.innerHeight;
        var sctop=document.body.scrollTop;
        var pageh = $("#ct").height();
        if((wh+sctop)>=pageh){
            if(m_list.nextpage && m_list.isload){
                if($(".loading_more").length == 0){
                    var html = "<div class=\"loading_more\"><span class=\"load\"><i class=\"icon_load\"></i>努力加载中......</span></div>";
                    $(".jingpin_w").append(html);
                }else{
                    $(".loading_more").html("<span class=\"load\"><i class=\"icon_load\"></i>努力加载中......</span>").show();
                }
                var next_page = m_list.page + 1;
                m_list.init(next_page);
            }
        }
    });

});