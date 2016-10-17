/**
 * 
 * @ 客户端适配 
 * @ liudi   2016/01/06
 * @ version v_0.1
 */

define(function(require, exports, module) {
    require("zepto");
    require('../common/base');
    require("../common/callnative");
    var nativeInfo = {}; // 客户端信息
    var plateForm = "", // android ios
        version = ""; // 客户端版本 （3.5.5）
    $.calljs.adaptApp_nativeinfocallback = function(data) {
        if (data) {
            nativeInfo = JSON.parse(data);
            plateForm = nativeInfo.platform;
            version = nativeInfo.version;
            var versionNum = parseInt(version.replace(/\./g, ''));
            // 如果客户端版本小于430,则显示topBar
            if (versionNum < 430) {
                document.getElementById("topBar").style.display = "block";
            }
        }
    };
    // 1.确认title bar的渲染是不是同步的，如果同步则保证在渲染其他dom之前调用此方法，
    // 如果是异步渲染的title bar则渲染完成后立即调用，尽可能避免屏幕跳跃的情况。
    // 2.该js可以多平台下引用，但该方法只在客户端情况下使用，对于多平台适配的页面，请自行区分平台。
    // 3.因为id为topBar在common.css默认隐藏，所以多平台适配页面也要在第一时间显示该dom

    exports.hideTopBar = function() {
        $.common.get_nativeinfo("$.calljs.adaptApp_nativeinfocallback");
    };
});