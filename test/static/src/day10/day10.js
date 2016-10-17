/*
* 列表页代码
* */
define(function (require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");

    $.cookie.set("pos_value","ten");
    $.cookie.set("pos_type","ten");
    var track = require("../common/track_v2");
    track.init("M");
    var track_data = {
        pos_type:'ten',
        pos_value:'ten'
    };

    //引入曝光统计
    var exposure = require("../common/exposure");
    //置顶功能
    var gotop = require("../common/gotop");
    gotop.init();

    //显示下载浮层
    //var showFloat = require('../common/showFloat');
    //showFloat.showFloat();
    //showFloat.closeOtherFloat();
    var showFloat = require('../common/show_float');
    showFloat.showDownloadGuide();

    var m_list ={};

    //banner加载
    // $.ajax({
    //     type: "GET",
    //     url: "/tao800/bannerv2.json?platform=android&productkey=tao800&cityid=0&channelid=all&userType=1&url_name=dailyten&image_model=jpg&image_type=si2",
    //     dataType:"json",
    //     success: function (data) {
    //         var _json = data;
    //         if(_json.length > 0){
    //             var banner_img = _json[0].image_big_ios_url;
    //             var banner_tt = _json[0].detail;
    //             var banner_html = "";
    //             banner_html += "<div class='day10_banner'>";
    //             banner_html += "<img src='"+banner_img+"'/>";
    //             banner_html += "</div>";
    //             banner_html += "<div class='day10_title'>"+banner_tt+"</div>";
    //             $("#day10_banner").html(banner_html);
    //         }else{
    //             $("#day10_banner").hide();
    //         }
    //     },
    //     timeout:20000,
    //     error:function(){
    //         $("#day10_banner").hide();
    //     }
    // });


    //列表页数据展示
    m_list.init = function(){
        $.ajax({
            type: "GET",
            url: "/v3/tendeals?image_type=si2&page=1&per_page=10&image_model=jpg",
            dataType:"json",
            data:m_list.data_init,
            success: function (data) {
                console.log(data);
                var objects = data.objects,
                    banner = data.banner;
                if(objects.length > 0){
                    var load_img = "//i0.tuanimg.com/ms/zhe800m/static/img/img_311_185.jpg";
                    var list_html = "";
                    list_html += "<ul class='list'>";
                    for (var i = 0; i < objects.length; i++) {
                        var title = objects[i].title;       //商品名称
                        var recommend_reason = objects[i].recommend_reason;       //小编说
                        var related_recommend = objects[i].related_recommend;       //相关推荐
                        var source_type = objects[i].source_type;   //商品来源：1--是商城，0--是淘宝/天猫
                        var baoyou = objects[i].baoyou;     //包邮
                        var begin_time = objects[i].begin_time.replace("-", "/");     //开始时间
                        begin_time = new Date(begin_time).valueOf();
                        var expire_time = objects[i].expire_time.replace("-", "/");     //结束时间
                        expire_time = new Date(expire_time).valueOf();
                        var price = objects[i].price / 100;       //折扣价
                        var oos = objects[i].oos;     //0代表未卖光，1代表已卖光
                        var now = new Date().valueOf();
                        var start = false;
                        var end = false;
                        if (now < begin_time) {
                            start = true;
                        }
                        if(now > expire_time){
                            end = true;
                        }

                        if(source_type == 1){
                            list_html+="<li data-url='"+$.zheui.domain+"/m/detail/" + objects[i].id + "' data-id='"+objects[i].id +"'><div class='commodity_info'>";
                        }else{
                            list_html += "<li data-url=\"" + objects[i].wap_url + "\" data-id=\"" + objects[i].id + "\"><div class='commodity_info'>";
                        }

                        list_html += "<div class='img'><img src='"+load_img+"' img_url='"+objects[i].image_url+"'/><span class='price'>￥"+price+"</span></div>";
                        list_html += "<h2 class='title'>"+title+"</h2>";
                        list_html += "<p class='xb'>"+recommend_reason+"</p></div>";
                        if(related_recommend.length > 0){
                            for(var k=0; k<related_recommend.length; k++){
                                if(related_recommend[k].type == 0){
                                    list_html += "<div class='tag'>相关推荐：";
                                    var t_value = related_recommend[k].value.split(",");
                                    if(t_value.length > 3){
                                        var t_value_len = 3;
                                    }else{
                                        var t_value_len = t_value.length;
                                    }
                                    for(var j=0; j<t_value_len; j++){
                                        list_html +='<a href="/m/sou/soulist?keyword='+encodeURI(t_value[j])+'"><span>'+t_value[j]+'</span></a>';
                                    }
                                    list_html += "</div>";
                                }
                            }
                        }
                        if(start){
                            list_html += "<span class='status no_start'></span>";
                        }
                        if(end){
                            list_html += "<span class='status jieshu'></span>";
                        }
                        if(oos == 1){
                            list_html += "<span class='status qiangwan'></span>";
                        }
                        list_html += "</li>";
                    }
                    list_html += "</ul>";
                    $("#day10_list").append(list_html);
                    $("#loading").hide();
                    $(".day10").show();
                    $(".list").imglazyload({"imgattr": "img_url"});

                    //曝光统计
                    exposure.exposure_ev($("#day10_list").find("ul"),"li");
                    //绑定跳转方法
                    $.zheui.bindTouchGoto($(".list li .commodity_info"), function (obj,index) {
                        var commodityObj=obj.parents("li");
                        var url_id = commodityObj.attr("data-url");
                        if (url_id.length > 0) {
                            window.location.href = $.tracklog.outUrl(url_id);
                        }
                        $.tracklog.action('recommend',track_data,'{eventvalue:' + url_id + ',eventindex:' + (index+1) + '}');
                    });
                }else{
                    //页面高度控制
                    var win_height = window.innerHeight;
                    $("#zhe_list_main").css("height",win_height-44+"px").html("<span class='no_list_mes'>暂无商品</span>");
                    $("#loading").hide();
                };
                if (banner.image_big_ios_url !="") {
                    var banner_img = banner.image_big_ios_url;
                    var banner_tt = banner.detail;
                    var banner_html = "";
                    banner_html += "<div class='day10_banner'>";
                    banner_html += "<img src='"+banner_img+"'/>";
                    banner_html += "</div>";
                    banner_html += "<div class='day10_title'>"+banner_tt+"</div>";
                    $("#day10_banner").html(banner_html);
                }else{
                    $("#day10_banner").hide();
                };
            },
            timeout:20000,
            error:function(){
                //第一页加载失败处理
                $("#loading").text("加载失败，点击重新加载");
                $.zheui.bindTouchGoto($("#loading"),function(){
                    $("#loading").html("<span class=\"icon\"></span><span class=\"txt\">努力加载中...</span>");
                    m_list.init();
                });
            }
        });
    };

    //初始化，第一页信息
    m_list.init();


});