/**
 * Created by spf on 2015/4/1.
 */
define(function(require,exports,module){
    var $ = require("zepto");
    require("../common/base");
    require("../common/callnative");
    var myLayer = require("../order/showFloat_v2");
    $.zheui.addhistory();
    setfooter_fixed();
    //查看订单详情
    $.zheui.bindTouchGoto($(".goods_info"),function(obj){
       var url=obj.attr("data-url");
       var platform_type = $.zheui.getUrlKeyVal('platformType');
        //配合易信url存储支付方式
       if(platform_type){
            url = url + '&platformType='+ platform_type;
       }
       window.location.href=url;
    });
    //判断屏幕的高度是否可以放得下所有的文档
    function setfooter_fixed(){
        var wh = window.innerHeight;
        var body_height=$("body").height();
        if(wh<body_height){
         var receiveInfo_height=$(".receive_info").height();
         $("#order_list").css("padding-bottom",receiveInfo_height+"px");
         $(".receive_info").removeClass("receive_info").addClass("receive_info_fixed");
        }
    }
    setTimeout(function(){
      window.onpopstate = function() {
          window.location.href = "//m.zhe800.com/";
      };
      //付款成功页 下载浮层引导
      myLayer.insertLayer($("#ct"), "download1");
    },100);

});