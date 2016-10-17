define(function(require, exports, module) {
	require("../common/base");
    require("../common/track_v2");


/**
*@params	{zeptoObject}	插入浮层的对象（默认为#ct)
*@params	{string}		b.gif打点的event参数
*@params	{string}		浮层的dom
*@params	{string}		下载文字提示
*/
	exports.insertLayer = function(obj, event, htmlstr,textInfo) {
		var _obj = obj || $("#ct");
		var _text = textInfo || '专享物流信息实时提醒！';
		var _html = htmlstr || '<div class="download-float">'
					+ '<div class="dl-icon"></div>'
					+ '<div class="dl-text">'
					+ '<p>下载手机app</p>'
					+ '<p class="dl-text">#TEXTINFO#</p>'
					+ '</div>'
					+ '<div class="dl-btn"></div>'
					+ '<span class="dl-close"><i></i></span>'
					+ '</div>';
    	_html = _html.replace('#TEXTINFO#', _text);
    	_obj.append(_html);	

    	$.zheui.bindTouchGoto($(".dl-btn"), function(){
    		$.tracklog.action(event);
    		goToHome();
    	});

    	$.zheui.bindTouchGoto($(".dl-close"), function(){
    		$(".download-float").hide();
    	});	
	};




	// 调起客户端
	function goToHome() {
		var t1 = new Date().getTime();
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

		//当调起app时候js进入后台调起运行，有个阻塞的过程，阻塞的时间是600-900ms(依照淘宝的)
		var timeout = setTimeout(function() {
			var hasApp = true;
			var t2 = new Date().getTime();
			//可以下载1025
			if (!t1 || t2 - t1 < 1000 + 200) {
				hasApp = false;
			}
			download(hasApp);
			clearTimeout(timeout);
		}, 1000);
	}

	// 下载客户端
	function download(hasApp) {
		var utm_csr = $.cookie.get("utm_csr") || "";	//下载来源
		var bd = '';		//下载来源的值
		var down_url = "http://w.tuan800.com/dl/app/recommend/redirect?from=guanwang&app=tao800" + "&url=itunes.apple.com/cn/app/tao800-jing-xuan-du-jia-you-hui/id502804922?mt=8";
		if (utm_csr !== '' && utm_csr != 'direct') {
			bd = utm_csr.substring(utm_csr.indexOf("_") + 1);
		}
		if (!hasApp) {
			$.ajax({
				type: "GET",
				url: "/m/supernatant?utm_source=" + utm_csr,
				success: function(data) {
					if (!$.os.ios) {
						if(bd){
							down_url = "//m.zhe800.com/download/bd/?bd=" + bd;
							console.log(down_url)
						}else{
							down_url = '//d.tuan800.com/dl/Zhe800_wap.apk';
							console.log(down_url)
						}
						
					}
					window.location.href = down_url;
				}
			});
		}
	}
});