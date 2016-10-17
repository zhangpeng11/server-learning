/*
 * name:imglazyload.js
 * intro:图片延迟加载，适用于列表页，支持 window scroll 事件和js模拟滚动事件 touch
 * version: v1.0
 * author: luoronghang
 * date: 2014/04/02
 */
define(function(require, exports, module) {
    (function($){
        $.fn.imglazyload=function(options){
            var defaults={
                container:window,
                event:"scroll",
                imgattr:"ref"
            }
            var opts = $.extend(defaults,options);

            //取元素的页面绝对 X位置
            var getLeft = function(El){
                var left = 0;
                try{
                    do{
                        left += El.offsetLeft;
                    }while((El = El.offsetParent).nodeName != 'BODY');
                    return left;
                }catch(err){}
            };

            //取元素的页面绝对 Y位置
            var getTop = function(El){
                try {
                    var top = 0;
                    do {
                        top += El.offsetTop;
                    } while ((El = El.offsetParent).nodeName != 'BODY');
                    return top;
                }catch(err){}
            };

            var _this = $(this);
            if(!_this.length){return}
            var _thisIndex = _this.length-1;
            var imgs = _this.eq(_thisIndex).find("img");

            function loadImg(){
                if(opts.container!=window){
                    //图片容器
                    var container =$(opts.container);
                    var containerHeight=parseInt(container.css("height"));
                    for(var i=0 ; i < imgs.length; i++){
                        var imgTop = imgs[i].getBoundingClientRect().top;
                        //判断图片是否在显示区域内
                        if(imgTop <= containerHeight){
                            var imgUrl = $(imgs[i]).attr(opts.imgattr);
                            //如果图片已经显示，则取消赋值
                            if(imgs[i].src !== imgUrl){
                                imgs[i].src = imgUrl;
                            }
                        }
                    }
                }else{
                    var isWebkit = !!navigator.userAgent.match(/AppleWebKit\b/img);
                    var _scrollTop = isWebkit ? document.body.scrollTop : document.documentElement.scrollTop,
                        _scrollLeft = isWebkit ? document.body.scrollLeft : document.documentElement.scrollLeft,
                        _visibleWidth = document.documentElement.clientWidth,
                        _visibleHeight = document.documentElement.clientHeight;

                    //对所有图片进行批量判断是否在浏览器显示区域内
                    for(var i=0 ; i < imgs.length; i++){
                        // var imgTop = getTop(imgs[i]),
                        //     imgLeft = getLeft(imgs[i]);
                        // //判断图片是否在显示区域内
                        // if( imgTop >= _scrollTop && imgLeft >= _scrollLeft && imgTop <= _scrollTop+_visibleHeight && imgLeft <= _scrollLeft+_visibleWidth){
                        //     var imgUrl = $(imgs[i]).attr(opts.imgattr);
                        //     //如果图片已经显示，则取消赋值
                        //     if(imgs[i].src !== imgUrl){
                        //         imgs[i].src = imgUrl;
                        //     }
                        // }
                        var bounds = imgs[i].getBoundingClientRect(),
                        h = document.documentElement.clientHeight;
                        if (bounds.bottom > 0 && bounds.top < h) {
                            var imgUrl = $(imgs[i]).attr(opts.imgattr);
                            //如果图片已经显示，则取消赋值
                            if(imgs[i].src !== imgUrl){
                                imgs[i].src = imgUrl;
                            }
                        }
                    }
                }
            }

            //执行
            loadImg();
            $(opts.container).bind(opts.event,loadImg);
        };
    })(Zepto);
});
