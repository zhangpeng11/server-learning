/*
 * 专题页JS
 * */
define(function (require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/track");
    require("../common/imglazyload");

    //引入曝光统计
    var exposure = require("../common/exposure");

    var id = $.zheui.getUrlKeyVal("id");


    function zt_init(){
        $.ajax({
            type: "GET",
            url: "/msite/banner/detail?id="+id+"&vt="+new Date().getTime(),
            dataType:"json",
            success: function (data) {
                var _json = data;
                if(_json.child_banner.length > 0){
                    var html = "";
                    html += "<div class='banner'><img src='"+_json.image_url+"'/></div>";
                    html += "<div id='zt_main'>";

                    for(var i=0; i<_json.child_banner.length; i++) {
                        var title = _json.child_banner[i].title;
                        if (title.length > 0) {
                            html += "<h2 class='category-title'>" + title + "</h2>";
                        }
                        if(_json.child_banner[i].deals.length > 0){
                            html += "<ul class='list'>";
                            for (var j = 0; j < _json.child_banner[i].deals.length; j++) {
                                var list_price = _json.child_banner[i].deals[j].list_price / 100;
                                var price = _json.child_banner[i].deals[j].price / 100;
                                var zhekou = (price / list_price * 10).toFixed(1);  //折扣
                                var source_type = _json.child_banner[i].deals[j].source_type;  //商品来源：1--是商城，0--是淘宝/天猫
                                var shop_type = _json.child_banner[i].deals[j].shop_type;  //商铺类型：0--淘宝；1--天猫
                                var deal_type = _json.child_banner[i].deals[j].deal_type;
                                var today = _json.child_banner[i].deals[j].today;
                                if(source_type == 1){
                                    html += "<li data-url='"+$.zheui.domain+"/m/detail/"+_json.child_banner[i].deals[j].id+"' data-id='"+ _json.child_banner[i].deals[j].id + "'>";
                                }else{
                                    html += "<li id='"+_json.child_banner[i].deals[j].id+"' data-url=\"" + _json.child_banner[i].deals[j].wap_url + "\" data-id='"+ _json.child_banner[i].deals[j].id + "'>";
                                }
                                html += "<div class='img'>";
                                html += "<img src='//i0.tuanimg.com/ms/zhe800m/static/img/img_151_170.jpg' img_url='" + _json.child_banner[i].deals[j].square_image + "'/>";
                                if (deal_type == 3) {
                                    //优品汇
                                    html += '<span class="icon yph"></span>';
                                }
                                else if (today == 1) {
                                    //今日上新
                                    html += '<span class="icon jrsx"></span>';
                                }
                                var type = "";
                                if (source_type == 1) {
                                    type = "特卖商城";
                                } else {
                                    if(shop_type == 0){
                                        type = "去淘宝";
                                    }
                                    if(shop_type == 1){
                                        type = "去天猫";
                                    }
                                }
                                html += "</div>";
                                html += "<div class='attr'>" +
                                    "<span class='price'>￥" + price + "</span>" +
                                    "<del>￥" + list_price + "</del>" +
                                    "<span class='discount'>" + type + "</span>" +
                                    "<h3 class='title'>" + _json.child_banner[i].deals[j].short_title + "</h3>";
                                html += "</div></li>";
                            }
                            html += "</ul>";
                        }
                    }

                    html +="</div>";
                    $("#loading_init").hide();
                    $(".zt_w").html(html);
                    $("#zt_main").imglazyload({"imgattr": "img_url"});
                    //曝光统计
                    exposure.exposure_ev($(".list"),"li");

                    $.zheui.bindTouchGoto($(".list li"),function(o){
                        var url = o.attr("data-url");
                        var dealId = o.attr("data-id");
                        var is_weixin=isWeiXin();
                        if(is_weixin&&url.indexOf("out.tao800.com") >= 0){
                            window.location.href = "//m.zhe800.com/h5/deal/"+o.attr("id")+"/2";
                        }else{
                            window.location.href = $.tracklog.outUrl(url, {liststatus:0,dealId:dealId});
                        }
                    });
                }else{
                    $(".loading").html("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading_init"),function(){
                        $(".loading").html("<i class='icon_load'></i>加载中......");
                        zt_init();
                    });
                }
            },
            timeout:20000,
            error:function(){
                $(".loading").html("加载失败，点击重新加载");
                $.zheui.bindTouchGoto($("#loading_init"),function(){
                    $(".loading").html("<i class='icon_load'></i>加载中......");
                    zt_init();
                });
            }
        });
    }
    zt_init();

    function isWeiXin(){
        var ua = window.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i) == 'micromessenger'){
            return true;
        }else{
            return false;
        }
    }


});