/**
 * 统计代码ga
 */
define(function (require, exports, module) {
    console.log("====GA======");

    //统计，从URL上取cookie信息
    setgacookie();
    function setgacookie() {
        var key_arr = ["source", "platform", "version", "channelId", "deviceId", "userId", "cType", "cId", "dealId"], val_arr = [];
        for (var i = 0; i < key_arr.length; i++) {
            val_arr[i] = $.zheui.getUrlKeyVal(key_arr[i]) || "";
            $.cookie.set(key_arr[i], val_arr[i]);
        }
        getgacookie();
    }

    //统计，从cookie里取信息
    function getgacookie(){
        var key_arr = ["source", "platform", "version", "channelId", "deviceId", "userId", "cType", "cId", "dealId"],ga_cookie_json = {};
        for (var i = 0; i < key_arr.length; i++) {
            var name = key_arr[i];
            ga_cookie_json[name] = $.cookie.get(name) || "";
        }
        exports.ga_cookie = "header="+JSON.stringify(ga_cookie_json);

    }

});


