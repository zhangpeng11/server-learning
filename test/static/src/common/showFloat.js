define(function(require,exports,module){
    var $ = require("zepto");
    /**
     * 下载浮层模块
     * 
     */

   console.log("showFloat加载！");

     //显示下载浮层
    exports.showFloat=function(){
        //是否显示下载浮层

        var utm_csr = $.cookie.get("utm_csr");
        var one_day = $.cookie.get("one_day");
        if(one_day == null){
            if(utm_csr!='null'&&utm_csr!='direct'){
                $.ajax({
                    type:"GET",
                    url:"/m/supernatant?utm_source="+$.cookie.get("utm_csr"),
                    success:function(data){
                        if(data.show_download_view==1){
                            showdownFloat(1, data);
                        }
                        //console.log(data);
                    }
                });
            }else{
                $.ajax({
                    type:"GET",
                    url:"/m/supernatant?utm_source="+$.cookie.get("utm_csr"),
                    success:function(data){
                        if(data.show_download_view==1){
                            showdownFloat(0, data);
                        }
                        console.log(data);
                    }
                });
            }
        }
        
        //显示下载浮层
        function showdownFloat(url_type, data){
            
            console.log("showFloat显示下载浮层！");

            var htmlstr ='<div class="download_float">'+
                            '<div class="inner">'+
                                '<div class="intro">'+
                                    '<div class="img"></div>'+
                                    '<div class="txt">'+
                                        '<h2>折800</h2>'+
                                        '<p class="ico_star"></p>'+
                                        '<p class="t">'+data.description+'</p>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="btn_down">立即打开</div>'+
                                '<div class="close_area">'+
                                    '<span class="ico_close"></span>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
            $("#ct").append(htmlstr);
            $.zheui.bindTouchGoto($(".download_float .btn_down"),function(){
                var utm_csr = $.cookie.get("utm_csr");
                if( utm_csr != null){
                    if(utm_csr.indexOf("_") > -1 ){
                       var idx = utm_csr.indexOf("_");
                       utm_csr = utm_csr.substring(idx+1); 
                    }
                }else{
                    utm_csr = "";
                }
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
                        down_url = $.zheui.domain + "/download/bd/?bd="+utm_csr;
                    }
                }
                window.location.href = down_url;
            });
        }

    };
    //首页关闭下载浮层
    exports.closeHomeFloat=function(){

  console.log("showFloat关闭下载浮层！");

        var one_day = $.cookie.get("one_day");
        clearTimeout(timer);
        var timer = setTimeout(function (){
            $.zheui.bindTouchGoto($(".download_float .close_area"),function(){
                $(".download_float").hide();
                if(one_day == null){
                    seteExpires();
                }
                showfavFloat();
            });
        }, 300);

        //设置cookie 0:0:0过期
        function seteExpires(){
            var oDate = new Date();
            oDate.setDate( oDate.getDate()+1 );
            oDate.setHours(0);
            oDate.setMinutes(0);
            oDate.setSeconds(0);
            document.cookie="one_day=1;expires="+oDate.toGMTString()+';path=/';
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
            //关闭收藏浮层
            $.zheui.bindTouchGoto($(".favfloat .close_area"),function(){
                $(".favfloat").hide();
            });
        }
    };
    //其他页面关闭下载浮层不显示收藏浮层
    exports.closeOtherFloat=function(){
        var one_day = $.cookie.get("one_day");
        clearTimeout(timer);
        var timer = setTimeout(function (){
            $.zheui.bindTouchGoto($(".download_float .close_area"),function(){
                $(".download_float").hide();
                if(one_day == null){
                    seteExpires();
                }
            });
        }, 300);
        //设置cookie 0:0:0过期
        function seteExpires(){
            var oDate = new Date();
            oDate.setDate( oDate.getDate()+1 );
            oDate.setHours(0);
            oDate.setMinutes(0);
            oDate.setSeconds(0);
            document.cookie="one_day=1;expires="+oDate.toGMTString()+';path=/';
        }
    };



});
