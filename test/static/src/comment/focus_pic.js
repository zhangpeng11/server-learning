/**
 * 评价列表页图片展示，专用js
 */
define(function (require, exports, module) {
    //引用外界资源
    var Swipe = require("../common/swipe");
    require("../common/touch");
    var iScroll = require("../common/iscroll");
    function pic_touch_init(arr, gotofun) {
        var x_ismove;
        arr.each(function (index, ele) {
            $(ele).bind("touchstart",function (e) {
                x_ismove = false;
            }).bind("touchmove",function (e) {
                x_ismove = true;
            }).bind("touchend", function (e) {
                if (x_ismove) {
                    return;
                }
                if (typeof gotofun == "function") {
                    gotofun($(this), index);
                }
            });
        });
    }

    exports.swipe_img=function(obj){
       obj.each(function(o,p){
            var sliderImg=p;
            var img_li=obj.eq(o).find("li");

            if(img_li.length>2){

                var scrollWidth=0;
                img_li.forEach(function (item) {
                    var $item = $(item);
                    scrollWidth += $item.width();
                });
                scrollWidth+=img_li.length*10;
                obj.eq(o).find("ul").width(scrollWidth);
                scroll = new iScroll(p, {
                    snap: true,
                    momentum: false,
                    hScrollbar: false,
                    vScroll:false,
                    onScrollEnd: function () {}
                });
             }

           var useragent=navigator.userAgent;
           //针对小米系列手机绑定点击事件
           if((useragent.indexOf("HM")>-1)||(useragent.indexOf("MI")>-1)||(useragent.indexOf("HTC")>-1)) {//如果为小米系列的手机用click方法绑定点击事件(获取商品分类)
               img_li.each(function (index, ele) {
                   $(ele).click(function(){
                       img_touch($(this),index);
                   }) ;
               })
           }else{
               pic_touch_init(img_li, img_touch);
           }


            function img_touch(o, p) {
                //console.log(o);
                var imgarr = [];
                $.each(img_li.find("img"),function(o,p){
                    imgarr.push($(p).attr("src"));

                });
                if (!$("#sliderBigImg").length) {
                    var dt_big_image_html = "";
                    var dt_image_num_html = "";
                    var devpr = window.devicePixelRatio;   //像素比
                    var wd_width = window.innerWidth;      //屏幕宽
                    var wd_fbl = wd_width * devpr;      //分辨率
                    var img_height = "auto";
                    dt_big_image_html += "<div  class='dt_big_image' id='sliderBigImg'><ul>";

                    for (var i = 0; i < imgarr.length; i++) {
                        var imgurl=$.zheui.change_img_size(imgarr[i],"500x");
                        dt_big_image_html += "<li><img src='//i0.tuanimg.com/ms/zhe800h5/dist/img/img_placehd3.png' data-url='" + imgurl+ "'>";
                    }
                    dt_big_image_html += "</ul></div>";

                    dt_image_num_html += "<div class='dt_image_num' id='dt_bigimg_num'>";
                    for (var i = 0; i < imgarr.length; i++) {
                        dt_image_num_html += "<span></span>";
                    }
                    dt_image_num_html += "</div>";

                    $("#dt_bigimg_main").append(dt_big_image_html);
                    $("#dt_bigimg_main").append(dt_image_num_html);
                }

                var dt_height = $("#ct").css("height");
                var wh = window.innerHeight;
                var max = Math.max(wh,document.body.clientHeight);
                var height=$(".dt_big_image").css("height");
//                console.log($(window).scrollTop()+"px")
//                console.log(wh)
                var bigimg_height=(wh-height)/2;
//            $("#dt_bigimg").css("height", dt_height).show();
                $("#dt_bigimg").show();
                $("#dt_bigimg_main").show();
                $("#dt_bigimg_main").css("top",bigimg_height+"px");


                var $img = $("#sliderBigImg ul li img");
                $img.eq(p).attr("src", $img.eq(p).attr("data-url"));
                $("#dt_bigimg_num span").removeClass("curr").eq(p).addClass("curr");


                //绑定大图滑动事件
                var sliderbigImg = document.getElementById('sliderBigImg');
                var dt_bigimg_num = $("#dt_bigimg_num span");
                Swipe(sliderbigImg, {
                    startSlide: p,
                    //auto:2000,
                    continuous: false,
                    disableScroll: false,
                    stopPropagation: false,
                    callback: function (index, element) {
                        var $this = $img.eq(index);
                        $this.attr("src", $this.attr("data-url"));
                    },
                    transitionEnd: function (index, element) {
                        dt_bigimg_num.eq(index).addClass("curr").siblings().removeClass("curr");
                    }
                });

            }

            //空白区域点击取消大图
           if((useragent.indexOf("HM")>-1)||(useragent.indexOf("MI")>-1)) {//如果为小米系列的手机用click方法绑定点击事件(获取商品分类)
               $("#dt_bigimg_main").click(function(){
                   setTimeout( dtbg_touch(),2000);
                   }) ;
               $("#dt_bigimg").click(function(){
                   setTimeout( dtbg_touch(),2000);
               }) ;
           }else{
               pic_touch_init($("#dt_bigimg_main"), dtbg_touch);
               pic_touch_init($("#dt_bigimg"), dtbg_touch);
           }
            function dtbg_touch(){
                $("#dt_bigimg").hide();
                $("#dt_bigimg_main").hide();
                //删除创建的dome结构  避免重复绑定事件
                $("#sliderBigImg").remove();
                $("#dt_bigimg_num").remove();

            }
        })
    }
});



