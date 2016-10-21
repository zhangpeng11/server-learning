/**
 * http/https切换的兼容处理
 */
define(function(require, exports, module) {
	var $ = require("zepto");
    require('../common/base');

    /**
     * 售后、订单切换http/https的兼容处理函数
     * @param {string} url [页面按钮上的data-url]
     */
    exports.addProtocol = function(url){
    	var dataUrl = "";
    	if(url){
    		if(url.indexOf("http") > -1){
	    		dataUrl = url;
	    	}else{
	    		dataUrl = $.zheui.protocol + url;
	    	}
    	}
    	
    	return dataUrl;
    }
});