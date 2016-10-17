define(function(require, exports, module) {
    var im_fun = require("../im/im");

    //浮动客服显示

    var dialog = require('../common/dialog');
    var mydialog = new dialog();
        exports.showkf = function() {
        var btnKf = $("#zheKf")
        $.zheui.bindTouchGoto(btnKf, function(obj) {
            var _this = obj;
            showlayer();
        });

        function showlayer() {
          var htmlstr = '<div class="zhe800_kf"><span class="ico_close"></span><h2>折800官方客服</h2><p class="txt">客服电话 : 400-0611-800<br>服务时间：9:00-21:00 7x12小时 全年无休</p><p class="txt"><span id="lianxikefu_t">Q Q</span>: <span id="lianxikefu">800061025</span><br>服务时间：8:00-23:00 7x15小时 全年无休</p><p>其他时间 : 请先留言</p></div>';
          mydialog.create(2,htmlstr);
            im_fun.im_qq_init(IM_data.sellerid, {
                "class_touch": "#lianxikefu",
                "type": "zhe800_service",
                "qq": "800061025",
                "param": {
                    "t": "2",
                    "s": "7",
                    "d": ""
                }
            });
            var zhe800_kf = $(".zhe800_kf");
            $.zheui.bindTouchGoto(zhe800_kf.find(".ico_close"), function(obj) {
                var _this = obj;
                mydialog.hide();
            });
            $.zheui.bindTouchGoto($(".bg_layer"), function(obj) {
                var _this = obj;
                mydialog.hide();
            });
        }
    }
});