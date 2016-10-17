/**
*
*  dealid: 商品id，zid
*  orderid: 订单id
*  
***/

define(function(require, exports, module) {
	 //引用外界资源
    var $ = require("zepto");
    require("../common/track");
    var dialog = require("../common/dialog");
    var mydialog = new dialog();

	var url = encodeURIComponent(window.location.href);
	var main_url = "http://im.zhe800.com/h5/index.html";
	var im_sellerSwitch = false;
	var im_store = im_store || {};
	

	//im开关
	exports.sellerSwitch = function (sellerId,sclass){
		$.ajax({
	        type: "GET",
	        url: "/api/getsellerandswitch?vt=" + new Date().getTime() + "&sellerId=" + sellerId,
	        dataType: "json",
	        success: function(data) {
	        	var code = data.result.code;
	        	if(code == 0){
	        		//sellerSwitch值为true，开关打开，商家IM。值为false，开关关闭，qq咨询
	           		im_sellerSwitch = data.sellerSwitch;
	           		if(im_sellerSwitch){
	           			im_store.shopname = data.sellerInfo.nickName;
        				im_store.preSaleIM = data.sellerInfo.preSaleIM;
   						im_store.afterSaleIM = data.sellerInfo.afterSaleIM;
	           		}else{
	           			if(sclass){
	           				changeIcon(sclass);
	           			}
	           		}
	        	}else{
	        		//咨询qq
           			im_sellerSwitch = false;
           			if(sclass){
           				changeIcon(sclass);
           			}
	        	}

	        },
	        timeout: 20000,
	        error: function() {
	        	//咨询qq
       			im_sellerSwitch = false;
       			if(sclass){
       				changeIcon(sclass);
           		}

	        }

	    });

	};
	//打开聊天
	exports.open_IM_QQ = function (dom_json){
		var qq = dom_json.qq;
		var type = dom_json.type;
		var dealid = dom_json.dealid;
        var orderid = dom_json.orderid;
        var shopname = im_store.shopname;
        var preSaleIM = im_store.preSaleIM;
   		var afterSaleIM = im_store.afterSaleIM;

   		//统计打点
   		$.tracklog.action("im",dom_json.parm);
   		//点击联系商家按钮，打点统计，进入聊天页面。从聊天页面返回再点击联系商家按钮，打点不起作用
   		//加50ms延迟，解决打点不上的问题
        setTimeout(function (){
        	if(im_sellerSwitch){
				//打开IM
				if(type == "preSaleIM"){
					//售前
		        	window.location.href = main_url+"?refer="+url+"&busUid="+preSaleIM+"&shopname="+shopname+"&dealid="+dom_json.dealid;

				}else if(type == "afterSaleIM"){
					//售后
		            window.location.href = main_url+"?refer="+url+"&busUid="+afterSaleIM+"&shopname="+shopname+"&orderid="+dom_json.orderid;
				}

			}else{
				//打开QQ
				var _arr = qq.split(",");
		        if(_arr.length > 1){
		            var htmlstr='<ul class="select_qq">';
		            for(var i=0;i<_arr.length;i++){
		                htmlstr+='<li data-qq="'+_arr[i]+'"><i class="ico"></i>商家客服'+(i+1)+'号</li>';
		            }
		            htmlstr+='</ul>';
		            mydialog.create(2,htmlstr);
		            $.zheui.bindTouchGoto($(".select_qq li"),function(obj){
		                var _this = obj;
		                var qq = _this.attr("data-qq");
		                if(qq){
		                    window.location.href="mqq://im/chat?chat_type=wpa&uin="+qq+"&version=1&src_type=web&web_src=h5.m.zhe800.com cmp=com.tencent.mobileqq/.activity.JumpActivity";
		                    setTimeout(function(){
		                        mydialog.hide();
		                    },400);
		                }
		            });
		            $.zheui.bindTouchGoto($(".bg_layer"),function(obj){
		                mydialog.hide();
		            });
		        }else{
		            window.location.href="mqq://im/chat?chat_type=wpa&uin="+_arr[0]+"&version=1&src_type=web&web_src=h5.m.zhe800.com cmp=com.tencent.mobileqq/.activity.JumpActivity";
		        }

			}
		},50);
		
	};


	function changeIcon(sclass){
		var class_arr = sclass.split(",");
		if(class_arr.length > 1){
			for(var i=0;i<class_arr.length;i++){
               $(class_arr[i]).addClass('show_qq_ico');
            }
		}else{
			$(class_arr).addClass('show_qq_ico');
		}
		
	}


});