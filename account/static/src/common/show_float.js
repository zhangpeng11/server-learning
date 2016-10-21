//下载和标签浮层
define(function (require, exports, module) {
    require("../common/base");
    
    function _showDownloadGuide(url_type, data, page) {
        /*下载浮层字段
        head_word: "",    首行文字
        tail_word: "",    末行文字
        background_pic: "",    下载浮层背景图
        icon: "",        ICON
        button_pic: "",    下载按钮图
        download_link: "",    下载链接
        button: 0,    关闭按钮 0:不显示 1:显示
        display: ""    支持显示项 0:M站首页 1:M站其他页面 2:拦截页
        */
        var tpl = "";
        if (data.display.indexOf("0") == -1) {
            return;
        }
        tpl += '<div class="topapp">';
        if (data.background_pic) {
            tpl += '<img src="' + data.background_pic + '" class="img">';
        }
        if (data.button == 1) {
            tpl += '<span class="close"></span>';
        }
        if (data.icon) {
            tpl += '<span class="logo"><img src="' + data.icon + '" width="50" height="52"></span>';
        }
        if (data.head_word && data.tail_word) {
            tpl += '<span class="text"><em>' + data.head_word + '</em><br><i>' + data.tail_word + '</i></span>';
        } else if (data.head_word) {
            tpl += '<span class="text"><em>' + data.head_word + '</em></span>';
        } else if (data.tail_word) {
            tpl += '<span class="text"><em></em><br><i>' + data.tail_word + '</i></span>';
        }
        if (data.download_link && data.button_pic) {
            tpl += '<a class="btn btn_down btncur" data-href="' + data.download_link + '" href="javascript:void(0)"><img src="' + data.button_pic + '" height="32"></a>';
        } else if (data.download_link) {
            tpl += '<a class="btn btn_down btncur" data-href="' + data.download_link + '" href="javascript:void(0)"><span>立即打开</span></a>';
        } else if (data.button_pic) {
            tpl += '<a class="btn btn_down btncur" data-href="" href="javascript:void(0)"><img src="' + data.button_pic + '" height="32"></a>';
        } else {
            tpl += '<a class="btn btn_down btncur" data-href="" href="javascript:void(0)"><span>立即打开</span></a>';
        }


        tpl += '</div>';
        
        //topappcur 关闭 btncur 打开
        if ($(".topapp").size() == 0) {
            $("#ct").before(tpl);
            //显示
            if (!$.cookie.get("c_down_guide_today") || $.cookie.get("c_down_guide_today") == 0) {
                $(".topapp").addClass("topappcur");  //执行添加该样式即可添加下载栏目！
            }
            
            $.zheui.bindTouchGoto($(".topapp .close"), function() {

                var cookie_down_count = $.cookie.get("c_down_guide_count") || 1;

                $(".topapp").addClass("topappclose");
                _setExpires("c_down_guide_today", 1, 1);
                $.tracklog.action("downoff");

                cookie_down_count++;
                _setExpires("c_down_guide_count", cookie_down_count, 365);
            });


            $.zheui.bindTouchGoto($(".topapp .btn_down"), function (el) {
                var utm_csr = $.cookie.get("utm_csr"),
                down_url = el.attr("data-href");

                $(".topapp").addClass("topappclose");
                _setExpires("c_down_guide_today", 1, 365);
                $.tracklog.action("downon");

                if (down_url != "") {
                    window.location.href = down_url;
                    return;
                }

                if (utm_csr != null) {
                    if(utm_csr.indexOf("_") > -1) {
                     var idx = utm_csr.indexOf("_");
                     utm_csr = utm_csr.substring(idx + 1); 
                 }
             } else {
                utm_csr = "";
            }

            down_url = "http://d.tuan800.com/dl/Zhe800_wap.apk";
            //调起客户端
            var iframe = document.getElementById('#openApp');
            if (iframe) {
                iframe.src = 'zhe800://goto_home';
            } else {
                iframe = document.createElement('iframe');
                iframe.id = 'openApp';
                iframe.src = 'zhe800://goto_home';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            if ($.os.ios) { //苹果系统下折800应用的下载网址
                down_url = "http://w.tuan800.com/dl/app/recommend/redirect?from=guanwang&app=tao800&url=itunes.apple.com/cn/app/tao800-jing-xuan-du-jia-you-hui/id502804922?mt=8";
            } else {
                if (url_type == 1) {
                    down_url = $.zheui.domain + "/download/bd/?bd=" + utm_csr;
                }
            }
            window.location.href = down_url;
        });

        // 3秒后自动隐藏
            /*setTimeout(function() {
                //$.zheui.scrollTo(3 * 1000, $(".topapp").height() + 1);
                //if (!page) {
                if (!$.cookie.get("c_down_guide_today") || $.cookie.get("c_down_guide_today") == 0) {
                    $(".topapp").addClass("topappclose");
                }
                //}
            }, 3 * 1000);*/
        }
    }

    //设置cookie 0:0:0过期
    function _setExpires (cookie_key, cookie_value, days) {
        var date = new Date();

        date.setDate(date.getDate() + days);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        document.cookie = cookie_key + "=" + cookie_value + ";expires=" + date.toGMTString() + ';path=/';
    }

    //显示下载引导
    //首页page true
    exports.showDownloadGuide = function (page) {

        var utm_csr = $.cookie.get("utm_csr");  //下载来源
        var down_count = $.cookie.get("c_down_guide_count") || 1;
        var down_day = $.cookie.get("c_down_guide_today") || 0;
        console.log("down_count" + down_count);
        console.log("down_day" + down_day);
        if (down_day == 1 || down_count > 3) {
            return;
        }

        // if ($.os.ios && $.bs.safari) {

        //      console.log("问题执行1");
        //     if (!$.bs.baidu && !$.bs.qq && !$.bs.uc && !$.bs.miui) {
            
        //         console.log("都不是，问题执行2"+$.bs);

        //         return;
        //     }
        // }
        //console.log("问题执行3");


        if (utm_csr!='null' && utm_csr!='direct') {
            $.ajax({
                type: "GET",
                url: "/m/supernatant?utm_source=" + utm_csr,
                success: function (data) {
                    _showDownloadGuide(1, data, page);
                }
            });
        }else{
            $.ajax({
                type: "GET",
                url: "/m/supernatant?utm_source=" + utm_csr,
                success: function (data) {
                    _showDownloadGuide(0, data, page);
                }
            });
        }
    };

    //显示添加收藏标签的引导
    exports.showTagGuide = function () {
        var tpl = '<div class="bottomtip"><sub style="left:#LEFT#%;"></sub><span class="close"></span><span class="logo"></span>#BROWSER_GUIDE#</div>',
        ios_safari = '<p>添加到手机屏幕可一键访问!点击下方<i class="ico ico_ios"></i>再点“添加到主屏幕”。</p>',
        other_browser = '<p>添加为书签可一键快速访问！点击下方<i class="ico #ICON#"></i>再点“添加书签”。</p>',
        tag_count = $.cookie.get("c_tag_guide_count") || 1,
        tag_today = $.cookie.get("c_tag_guide_today") || 0,
        is_show = false;

        //console.log("showTagGuide");
        //bottomtipcur 打开 bottomtipclose 关闭
        if ($(".bottomtip").size() == 0) {
            if ($.os.ios) {
                if ($.bs.miui) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_mi"))
                    .replace("#LEFT#", 85);
                    is_show = true;
                }
                else if ($.bs.uc) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_qq"))
                    .replace("#LEFT#", 47);
                    is_show = true;
                }
                else if ($.bs.qq) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_qq"))
                    .replace("#LEFT#", 47);
                    is_show = true;
                }
                else if ($.bs.baidu) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_qq"))
                    .replace("#LEFT#", 74);
                    is_show = true;
                }
                else {
                    tpl = tpl.replace("#BROWSER_GUIDE#", ios_safari)
                    .replace("#LEFT#", 47);
                    is_show = true;
                }
            }
            else if ($.os.android) {
                if ($.bs.miui) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_mi"))
                    .replace("#LEFT#", 85);
                    is_show = true;
                }
                else if ($.bs.uc) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_qq"))
                    .replace("#LEFT#", 47);
                    is_show = true;
                }
                else if ($.bs.qq) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_qq"))
                    .replace("#LEFT#", 47);
                    is_show = true;
                }
                else if ($.bs.baidu) {
                    tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_qq"))
                    .replace("#LEFT#", 74);
                    is_show = true;
                }
            }
            //线下调试专用，上线注释
            //else {
                /*tpl = tpl.replace("#BROWSER_GUIDE#", ios_safari) 
                .replace("#LEFT#", 47);*/
                /*tpl = tpl.replace("#BROWSER_GUIDE#", other_browser.replace("#ICON#", "ico_qq"))
                .replace("#LEFT#", 74);*/
                //is_show = true;
            //}
            if (!is_show) {
                //非以上浏览器，不显示
                return;
            }

            $("#ct").before(tpl);

            //当cookie小于等于3时显示弹窗
            if (tag_today == 0 && tag_count <= 3) {
                $(".bottomtip").addClass("bottomtipcur");
                _setExpires("c_tag_guide_today", 1, 1);
            }

            $.zheui.bindTouchGoto($(".bottomtip .close"), function() {
                var cookie_tag_count = $.cookie.get("c_tag_guide_count") || 1;

                $(".bottomtip").addClass("bottomtipclose");
                $.tracklog.action("labeloff");

                cookie_tag_count++;
                _setExpires("c_tag_guide_count", cookie_tag_count, 365);
            });
        }

        if (tag_today == 0 && tag_count <= 3) {
            $(".bottomtip").removeClass("bottomtipclose");
        }

        // 10秒后自动隐藏
        setTimeout(function() {
            if (tag_today == 0 && tag_count <= 3) {
                $(".bottomtip").addClass("bottomtipclose");
            }
        }, 10 * 1000);
    }
});
