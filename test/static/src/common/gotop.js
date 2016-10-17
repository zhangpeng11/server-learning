/*
 * name:gotop.js
 * intro:返回顶部
 * version: v1.0
 * author: luoronghang
 * date: 2014/08/29
 */
define(function(require, exports, module){
    exports.init=function(){
        $("#ct").before('<a name="top"></a>');
        $("#ct").append('<a  id="floatGotop"></a>');
        $(window).bind("scroll",function(){
            var _wh = window.innerHeight;
            var _sctop=document.body.scrollTop;
            var _pageh = $("#ct").height();
            if(_pageh >= (_wh*2)){
                if(_sctop > 0){
                    $("#floatGotop").show();
                }else{
                    $("#floatGotop").hide();
                }
            }
        });
        $('#floatGotop').on('click',function(event){
        $(this).css('cursor', 'pointer');
        setTimeout(function() {
            window.scroll(0, 0);
        }, 100);
        });
    }
});
