/*
 * name:callnative.js
 * intro:web与native交互框架，此框架对调用native端进行统一封装和与native交互的通用方法
 * version: v1.0
 * author: luoronghang
 * date: 2014/03/25
 */
define(function(require, exports, module) {
    (function($){

        //判断是否为IOS系统
        function zhe_ios(userAgent) {
            $.ios = {};
            $.ios.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
            $.ios.iphone = !$.ios.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
            $.ios.ios = $.ios.ipad || $.ios.iphone;
        }
        zhe_ios(navigator.userAgent);

        //是ios系统，执行IOS js模块
        if ($.ios.ios) {
            if (typeof window.WebViewJavascriptBridge == "undefined") {
                var messagingIframe;
                var sendMessageQueue = [];
                var receiveMessageQueue = [];
                var messageHandlers = {};

                var MESSAGE_SEPARATOR = '__WVJB_MESSAGE_SEPERATOR__';
                var CUSTOM_PROTOCOL_SCHEME = 'wvjbscheme';
                var QUEUE_HAS_MESSAGE = '__WVJB_QUEUE_MESSAGE__';

                var responseCallbacks = {};
                var uniqueId = 1;

                function _createQueueReadyIframe(doc) {
                    messagingIframe = doc.createElement('iframe');
                    messagingIframe.style.display = 'none';
                    doc.documentElement.appendChild(messagingIframe);
                }

                function init(messageHandler) {
                    if (WebViewJavascriptBridge._messageHandler) {
                        throw new Error('WebViewJavascriptBridge.init called twice');
                    }
                    WebViewJavascriptBridge._messageHandler = messageHandler;
                    var receivedMessages = receiveMessageQueue;
                    receiveMessageQueue = null;
                    for (var i = 0; i < receivedMessages.length; i++) {
                        _dispatchMessageFromObjC(receivedMessages[i]);
                    }

                    var readyEvent = new Event('WebViewJavascriptBridgeDidCreate');
                    document.dispatchEvent(readyEvent);
                }

                function send(data, responseCallback) {
                    _doSend({
                        data: data
                    }, responseCallback);
                }

                function registerHandler(handlerName, handler) {
                    messageHandlers[handlerName] = handler;
                }

                function callHandler(handlerName, data, responseCallback) {
                    _doSend({
                        handlerName: handlerName,
                        data: data
                    }, responseCallback);
                }

                function _doSend(message, responseCallback) {
                    if (responseCallback) {
                        var callbackId = 'cb_' + (uniqueId++) + '_' + new Date().getTime();
                        responseCallbacks[callbackId] = responseCallback;
                        message['callbackId'] = callbackId;
                    }
                    sendMessageQueue.push(JSON.stringify(message));
                    messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE;
                }

                function _fetchQueue() {
                    var messageQueueString = sendMessageQueue.join(MESSAGE_SEPARATOR);
                    sendMessageQueue = [];
                    return messageQueueString;
                }

                function _dispatchMessageFromObjC(messageJSON) {
                    setTimeout(function _timeoutDispatchMessageFromObjC() {
                        var message = JSON.parse(messageJSON);
                        var responseCallback;

                        if (message.responseId) {
                            responseCallback = responseCallbacks[message.responseId];
                            if (!responseCallback) {
                                return;
                            }

                            //将字符串转为方法
                            eval(responseCallback)(message.responseData);
                            //responseCallback(message.responseData);
                            delete responseCallbacks[message.responseId];
                        } else {
                            if (message.callbackId) {
                                var callbackResponseId = message.callbackId;
                                responseCallback = function(responseData) {
                                    _doSend({
                                        responseId: callbackResponseId,
                                        responseData: responseData
                                    });
                                }
                            }

                            var handler = WebViewJavascriptBridge._messageHandler;
                            if (message.handlerName) {
                                handler = messageHandlers[message.handlerName]
                            }

                            try {
                                handler(message.data, responseCallback);
                            } catch (exception) {
                                if (typeof console != 'undefined') {
                                    console.log("WebViewJavascriptBridge: WARNING: javascript handler threw.", message, exception);
                                }
                            }
                        }
                    }, 0);
                }

                function _handleMessageFromObjC(messageJSON) {
                    receiveMessageQueue = null;
                    if (receiveMessageQueue) {
                        receiveMessageQueue.push(messageJSON);
                    } else {
                        _dispatchMessageFromObjC(messageJSON);
                    }
                }

                window.WebViewJavascriptBridge = {
                    init: init,
                    send: send,
                    registerHandler: registerHandler,
                    callHandler: callHandler,
                    _fetchQueue: _fetchQueue,
                    _handleMessageFromObjC: _handleMessageFromObjC
                };

                var doc = document;
                _createQueueReadyIframe(doc);
                var readyEvent = new Event('WebViewJavascriptBridgeReady');

                doc.addEventListener('WebViewJavascriptBridgeReady', function(e) {
                    window.WebViewJavascriptBridge.init();
                }, false);
                doc.dispatchEvent(readyEvent);
            }
        }



        //调用native统一入口
        $.callNative = function(param){
            if(typeof param=="undefined" || typeof param != "object"){
                // alert("param error!");
                return;
            }
            var methodname = '',
                methodparam ='',
                callback ='';
            if(param.methodname){
                methodname = param.methodname;
            }
            if(param.methodparam){
                methodparam = JSON.stringify(param.methodparam);
            }
            if(param.callback){
                callback = param.callback;
            }
            console.log("mhdname:"+methodname+"\n"+"mhdparam:"+methodparam+"\n"+"callback:"+callback);
            try{
                //window.WebViewJavascriptBridge.callHandler(methodname,methodparam,callback);
                if($.os.ios){
                    if(typeof WebViewJavascriptBridge == 'object'){
                        window.WebViewJavascriptBridge.callHandler(methodname,methodparam,callback);
                    }else{
                        var callnativeinit;
                        callnativeinit = setInterval(function(){
                            if(typeof WebViewJavascriptBridge == 'object'){
                                clearInterval(callnativeinit);
                                window.WebViewJavascriptBridge.callHandler(methodname,methodparam,callback);
                            }
                        },100);
                    }
                }else{
                    window.WebViewJavascriptBridge.callHandler(methodname,methodparam,callback);
                }
            }catch(e){
                //console.log(e.message);
            }
        };

        //通用方法封装
        $.common = function(){};

        /*
        * 加载页面
        * @params 参数为json对象,具体字段：
        * {"title":"商品详情","url":"http://h5.m.zhe800.com/index_zhe800.htm","clearhistory":"1"}
        * title:title栏显示的文字，
        * url：跳转的链接地址
        * clearhistory:通知native清除上一次的浏览器历史，值为数字型，代表需求清除的历史数
        * */
        $.common.loadpage=function(params){
            var param = {"methodname":"loadpage","methodparam":params};
            $.callNative(param);
        };

        /*
        * 打开登录界面
        * @params
        * {"isreload":"true/false","url":"http://h5.m.zhe800.com/index_zhe800.htm"}
        * isreload:登录后是否跳转至某个页面，true：跳转至指定页面，false：刷新当前页面
        * url：需要跳转的 url 地址
        * */
        $.common.login=function(params){
            var param = {"methodname":"login","methodparam":params};
            $.callNative(param);
        };

        /*
        * 弹出toast提示，3秒后消失
        * @params
        * {"text":"提示信息文本"}
        * text:需要提示文字信息
        * */
        $.common.toast=function(params){
            var param = {"methodname":"toast","methodparam":params};
            $.callNative(param);
        };

        /*
        * 弹出 dialog 提示
        * @params
        * {"content":"确定支付吗？","btn_txt":["取消","确定"]}
        * content：提示信息文本
        * btn_txt：值为数组格式，根据需求传入具体按钮的文字，最多两个，以逗号分隔
        * @callback:回调方法名
        * 如需点击按钮后做出相应响应，需native在回调方法内传入被点击按钮的索引，js根据此索引值做出具体行为
        * */
        $.common.dialog=function(params,callback){
            var param = {"methodname":"dialog","methodparam":params,"callback":callback};
            $.callNative(param);
        };
        /*
        * v2.0 支持传入 title字段
        * {“title”:”温馨提示”,"content":"确定支付吗？","btn_txt":["取消","确定"]}
        * 注：其他参数字段跟 dialog 一致
        * */
        $.common.dialogv2=function(params,callback){
            var param = {"methodname":"dialogv2","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
        * 显示或隐藏 loadingbar
        * @params
        * {"type":"0/1","cmd":"show/hide","text":"加载中提示文字"}
        * type:loadingbar类型，0：非阻塞，1：阻塞
        * cmd: show 显示，hide 隐藏
        * text:提示文字
        * */
        $.common.loadingbar=function(params){
            var param = {"methodname":"loadingbar","methodparam":params};
            $.callNative(param);
        };

        /*
         * 获取用户等级信息
         * @callback
         * 回调方法接收native传入的用户等级信息
         * {"rank":"5"}
         * */
        $.common.user_rank=function(callback){
            var param = {"methodname":"user_rank","callback":callback};
            $.callNative(param);
        };



        /*
         * 设置用户输入的收货地址信息
         * @params
         * {"reload_url":"http://www.dddd.com/sss/"}
         * reload_url:设置完地址信息后重新加载指定页面
         * */
        $.common.set_useraddress=function(params){
            var param = {"methodname":"set_useraddress","methodparam":params};
            $.callNative(param);
        };


        /*
         * 微信支付
         * @params
         * 参数是服务端提供的支付相关json数据，js拿到后传给native即可，
         * @callback
         * 回调方法接收native传入的支付成功或失败的信息
         * {"status":"success/fail"}
         * */
        $.common.weixin_pay=function(params,callback){
            var param = {"methodname":"weixin_pay","methodparam":params,"callback":callback};
            $.callNative(param);
        };


        /*
         * 支付宝支付
         * @params
         * 参数是服务端提供的支付相关json数据，js拿到后传给native即可，
         * @callback
         * 回调方法接收native传入的支付成功或失败的信息
         * {"status":"success/fail"}
         * */
        $.common.ali_pay=function(params,callback){
            var param = {"methodname":"ali_pay","methodparam":params,"callback":callback};
            $.callNative(param);
        };
         
        /*
         * QQ钱包支付
         * @params
         * 参数是服务端提供的支付相关json数据，js拿到后传给native即可，
         * @callback
         * 回调方法接收native传入的支付成功或失败的信息
         * {"status":"success/fail"}
         * */
        $.common.qq_pay=function(params,callback){
            var param = {"methodname":"qq_pay","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 银联APP支付
         * @params
         * 参数是服务端提供的支付相关json数据，js拿到后传给native即可，
         * @callback
         * 回调方法接收native传入的支付成功或失败的信息
         * {"status":"success/fail"}
         * */
        $.common.union_pay=function(params,callback){
            var param = {"methodname":"union_pay","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 苹果支付
         * @params
         * 参数是服务端提供的支付相关json数据，js拿到后传给native即可，
         * @callback
         * 回调方法接收native传入的支付成功或失败的信息
         * {"status":"success/fail"}
         * */
        $.common.apple_pay=function(params,callback){
            var param = {"methodname":"apple_pay","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 获取用户所在地省级信息
         * @callback
         * 回调方法接收native传入的用户所在地的省级信息
         * {"pvcid":"0978877","pvcname":"河北省"}
         * */
        $.common.get_location=function(callback){
            var param = {"methodname":"get_location","callback":callback};
            $.callNative(param);
        };
        /*
        * v2.0 可获取省份和市级信息
        * @callback
        * 回调方法接收native传入的用户所在地的省级信息
        * {"pvcid":"0978877","pvcname":"河北省""cityid":"2323333","cityname":"保定市"}
        * */
        $.common.get_locationv2=function(callback){
            var param = {"methodname":"get_locationv2","callback":callback};
            $.callNative(param);
        };

        /*
         * 通知native返回时重新加载上一级页面,也可指定加载 某个url地址
         * 使用场景：加载完下一个页面后才通知native返回上一级重新加载
         * @params
         * {"url":"http://h5.m.xiongmaoz.com/orders/h5/get_order_list"}
         * */
        $.common.back_reload=function(params){
            var param = {"methodname":"back_reload","methodparam":params};
            $.callNative(param);
        };

        /*
        * 通知native返回当前页面时需要刷新，
        * 使用场景是：当A页面需要跳转到B页面，在A页面加载完成时需要发送消息通知native从B页面返回A页面后刷新A页面。
        * @params
        * {"status":"true/false"}   status 表示 返回时是否执行刷新动作， true 为刷新，false 不刷新。
        * 正常情况下如不需要native返回时刷新页面 可不向native发送 refresh 消息
        * */
        $.common.refresh=function(params){
            var param = {"methodname":"refresh","methodparam":params};
            $.callNative(param);
        };

        /*
         *积分商品专用
         * @params
         * {"type":"0/1/2","btntxt":"(确定兑换|积分不足,赚积分)/(参与抽奖|积分不足,赚积分)/(确认出价|积分不足,赚积分)"}
         * type:积分商城三个模块标示，0：积分兑换，1：积分抽奖，2：积分竞拍
         * btntxt:底部bar上按钮的显示，根据type值相对应
         * callback: funname，需要处理的回调逻辑
         * TODO 注：此协议暂时无用，如使用需将此代码移到对应的模块内
         */
        $.common.jf_navbar=function(params,callback){
            var param = {"methodname":"jf_navbar","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
        * 获取支付信息
        *callback返回信息
        * {"os_type":"ios/android",”item_type”:”zhe800”,”ver”:”1.3.2”,”pay_type”:”alipayapp,weixinapp...”}
        * os_type：系统类型；item_type：商品类型；ver：版本号；pay_type：支持的支付类型，只返回app模式
        * "platform_type":"android/iphone/ipad/wp",
         "product_type":"zhe800/zhe800campus",
         "ver":"1.3.2",
         "pay_type":"unionpaywap,weixinapp,..."
        */
        $.common.get_paymessage=function(callback){
            var param = {"methodname":"get_pay_message","callback":callback};
            $.callNative(param);
        };

        /*
         * 获取是否支持当前支付方式
         *callback返回信息
         * {"pay_isok":"true/false"}
         * @params
         * {"pay_type":"weixinapp"}
         */
        $.common.get_pay_isok=function(params,callback){
            var param = {"methodname":"get_pay_isok","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
        * 通知客户端收藏
        * @params
        * {"cmd":"to_favorite/cancel_favorite"}
        * cmd:告诉客户端执行动作，to_favorite表示收藏，cancel_favorite表示取消收藏
        * callback：客户端的回调，带返回值：1表示成功，0表示失败
        * */
        $.common.favorite=function(params,callback){
            var param = {"methodname":"favorite","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 获取收藏状态
         * callback：客户端的回调，带返回值：1表示已收藏，0表示未收藏
         * */
        $.common.getfav_status=function(callback){
            var param = {"methodname":"getfav_status","callback":callback};
            $.callNative(param);
        };

        /*
         * 详情页分享
         * callback：客户端的回调，带返回值：1表示已收藏，0表示未收藏
         * */
        $.common.detail_share=function(){
            var param = {"methodname":"openShareDialog"};
            $.callNative(param);
        };


        /*
         * 通知客户端添加开卖提醒
         * @params
         * {"cmd":"set_alarm/cancel_alarm","id":"112332432","begin_time":"2014-10-13 09:00:00","expire_time":"2014-10-20 23:59:00","oos":"0"}
         * cmd:告诉客户端执行动作，set_alarm 表示设置提醒，cancel_alarm表示取消设置
         * id:表示商品id
         * begin_time:表示开始时间
         * expire_time:表示结束时间
         * oos：表示是否卖光
         * callback：客户端的回调，带返回值：1表示 设置/取消 成功，0表示 设置/取消 失败,2表示 设置重复（已设置）
         * */
        $.common.set_alarm=function(params,callback){
            var param = {"methodname":"set_alarm","methodparam":params,"callback":callback};
            $.callNative(param);
        };


        /*
        *获取已设置开卖提醒的商品dealid数据
        * @params
        * {"num":"100"}
        * num :表示 dealid 的数量，目前最多为100
        * callback：客户端的回调，带返回值：json数据
        * [{"dealid":"12312133213"},{"dealid":"12312133213"},{"dealid":"12312133213"}，{"dealid":"12312133213"}]
        * */
        $.common.get_alarmdealdata=function(params,callback){
            var param = {"methodname":"get_alarmdealdata","methodparam":params,"callback":callback};
            $.callNative(param);
        };


        /*
         * 获取网络类型
         * callback：客户端的回调，带返回值：1表示wifi，2表示非wifi 包含(2g,3g,4g),0表示无网络状态
         * */
        $.common.network_status=function(callback){
            var param = {"methodname":"network_status","callback":callback};
            $.callNative(param);
        };

        /*
         * 通知客户端回首页
         * */
        $.common.goto_home=function(){
            var param = {"methodname":"goto_home"};
            $.callNative(param);
        };


        /*
         * 通知客户端启动系统浏览器访问页面
         * {"url":"http://m.zhe800.com"}
         * Url:表示要打开的页面地址：地址中带有“http”则打开系统浏览器，带有“taobao://”则启动淘宝客户端走淘宝scheme方式
         * */
        $.common.open_browser=function(params){
            var param = {"methodname":"open_browser","methodparam":params};
            $.callNative(param);
        };

        /*
         * 通知客户端启动照相机，相册模块
         * params{count: 5} 通知客户端单次能上传的最大张数
         * callback: 客户端的回调，带有返回值 为json数据
         * {"imgmark":"thumbpic1"}  imgmark的值：为图片唯一标示 , 由 thumbpic + N(数字) 组成，比如（thumbpic1）
         * */
        $.common.open_cameraWidget=function(params,callback){
            var param = {"methodname":"open_cameraWidget","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 通知客户端开始上传图片
         * {"api_url":"http://th5.m.zhe800.com/trade/seller/products/uploadImage","imgmark":"thumbpic1"}
         * api_url：表示图片上传的地址
         * imgmark:需要上传的图片唯一标示
         * callback: 客户端的回调，带有返回值：为上传成功后服务器返回的json数据 + 对应的图片标示 + 成功或失败的状态
         *          {"id":"389x584.67ec2502d77188a50bde4c9b26ea2695.jpg","imageSeq":"","code":"0","imgmark":"thumbpic1","cli_status":"0/1"}
         *          imgmark:表示图片唯一标示
         *          cli_status:表示成功或失败的状态,0:成功，1失败
         * */
        $.common.start_upload=function(params,callback){
            var param = {"methodname":"start_upload","methodparam":params,"callback":callback};
            $.callNative(param);
        };


        /*
         * 获取客户端支持的所有协议方法
         * callback: 客户端的回调，带有返回值 为json数据
         * 举例数据：{"login":"true","loadingbar":"true"}
         * */
        $.common.get_allmethod=function(callback){
            var param = {"methodname":"get_allmethod","callback":callback};
            $.callNative(param);
        };

        /*
         * 调起客户端分享控件，此方法为通用方法，不局限在某一个页面内
         * {"out_url":"http://m.zhe800.com","content":"这是测试文字内容","title":"测试标题","","pic_url":"http://i0.tuanimg.com/ms/zhe800h5/dist/img/detail_first.png","share_platform":"1/2"，"source":"n","_ga":{"key1":"val1","key2":"val2"...}}
         * out_url:分享后的跳转url
         * content：分享的描述内容
         * title：分享的标题
         * pic_url：分享的缩略图地址
         * share_platform:表示分享到的平台，1是微信，2是朋友圈 ，也可同时传入 1,2 表示同时显示两个平台
         * source:表示分享的来源
         * callback: 客户端的回调，带有返回值 为number数据  0表示成功，1表示失败
         * _ga:统计需要传的参数
         * */
        $.common.share=function(params,callback){
            var param = {"methodname":"openShareDialog","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 通知客户端调起im
         * {"type":"deal/order/after_service/zhe800_service","j_info":"{"jid":"1231243124312442","name":"李宁专卖店","group":"3"}","data":"data"}
         * type:咨询类型，deal：表示商品咨询  order：表示订单咨询  after_service：售后咨询 zhe800_service：折800客服咨询
         * j_info：{"jid":"1231243124312442","name":"李宁专卖店","group":"3"} 表示商家或客服信息
         * jid：商家id/客服id
         * name：商家名称
         * group：组名，客服咨询中需要传入组名，比如，订单类，售后类 咨询
         * data：表示根据 type的值 所配置的数据
         * 示例：
         jid:组名，jids：组明细，busUid：主IM
         * 示例1(商品咨询)：
         * {"type":"deal","j_info":"{"jid":"****","jids":"***,***","busUid":"****","name":"李宁专卖店"}","data":"商品的deal数据 为json"}
         * 示例2(订单咨询)：
         * {"type":"order","j_info":"{"jid":"****","jids":"***,***","busUid":"****","name":"李宁专卖店"}","data":"{"orderid":"121231313"}"}
         * 示例3(售后咨询)：
         * {"type":"after_service","j_info":"{"jid":"****","jids":"***,***","busUid":"****","name":"李宁专卖店"}",
         * "data":"{"orderid":"121231313","aftersaleid ":"12311231312"}"}
         * 示例4(客服咨询)：
         * {"type":"zhe800_service","j_info":"{"jid":"","name":"折800官方客服","group":"3"}","data":""}
         * */
        $.common.open_imv2=function(params){
            var param = {"methodname":"open_imv2","methodparam":params};
            $.callNative(param);
        };

        /*
        * 获取客户端是否支持打开im
        * callback: 客户端的回调，带有返回值 为number数据  0表示支持调起im，1表示不支持/失败
        * */
        $.common.im_status=function(callback){
            var param = {"methodname":"im_status","callback":callback};
            $.callNative(param);
        };

        /*
        *通知native是否正常执行返回上一级页面
        *{"status":"true/false"}
        * status:表示具体状态，true 执行正常返回上一级，false不做任何动作(不返回上一级)
        * */
        $.common.isgoback=function(params){
            var param = {"methodname":"isgoback","methodparam":params};
            $.callNative(param);
        };

        /*
        * native执行js方法
        * calljs为通用一级方法名，所有二级方法名全部在calljs下扩展，二级方法名可在对应使用模块中编写，比如：$.calljs.goback=function(){ //code }
        * */
        $.calljs=function(){};

        /*
         * 通知native销毁历史页面
         * {"hisnum":"2/-1"}
         * hisnum:表示要销毁的历史页面层级数，从最近的页面往前推，比如：1表示销毁上1级，2表示销毁上2级，依次类推 3,4,5 等；-1 表示 销毁所有历史页面，即：回到首页。
         * */
        $.common.destroy_history=function(params){
            var param = {"methodname":"destroy_history","methodparam":params};
            $.callNative(param);
        };

        /*
         * 通知native跳转至特卖商城列表页
         * */
        $.common.goto_speciallist=function(){
            var param = {"methodname":"goto_speciallist"};
            $.callNative(param);
        };

        /*
         * 获取native相关信息
         * callback：客户端的回调，返回json数据
         * {"source":"1","platform":"ios","version":"3.5.5"}
         * */
        $.common.get_nativeinfo=function(callback){
            var param = {"methodname":"get_nativeinfo","callback":callback};
            $.callNative(param);
        };

        /*
         * 跳转至商品详情页包含（特卖商城、天猫、淘宝）
         * @params
         * {"id":"1091024","source_type":"1","out_url":"http://out.tao800.com/m/deal/1091024"}
         * id: 商品id 
         * source_type：商品类型：淘宝、天猫、特卖商城
         * out_url：最终跳转至商品详情的url，包含统计字段
         * */
        $.common.to_detail=function(params){
            var param = {"methodname":"to_detail","methodparam":params};
            $.callNative(param);
        };

        /*
         * 通知native webview重新被显示时回调js
         * callback：客户端的回调, webview重新被显示时回调js的方法，由js完成对页面内的处理逻辑
         * 使用场景：
         * 1)、A页面跳转至B页面后，通过返回bar 再次回到A页面时 native回调传入的callback方法通知页面 ，
         *  由js根据自身业务需求完成功能处理，比如某个数据局部更新。
         * */
        $.common.view_didappear=function(callback){
            var param = {"methodname":"view_didappear","callback":callback};
            $.callNative(param);
        };

        /*
         * 通知native启动图片查看器
         * @params
         * {"index":"2","image_data":[{"picurl":"http://z11.tuanimg.com/imagev2/trade/800x800.4c20bf5ac7c5d5646720a68095c33bb9.400x.jpg"},{"picurl":"http://z11.tuanimg.com/imagev2/trade/800x800.4c20bf5ac7c5d5646720a68095c33bb9.400x.jpg"},{"picurl":"http://z11.tuanimg.com/imagev2/trade/800x800.4c20bf5ac7c5d5646720a68095c33bb9.400x.jpg"}]}
         * index: 图片索引，native可以通过index的值定位到当前第N张图片上
         * image_data：图片数据，包含图片url，native可以通过数组的length取到当前图片的总数
         * */
        $.common.open_imagewidget=function(params){
            var param = {"methodname":"open_imagewidget","methodparam":params};
            $.callNative(param);
        };

        /*
         * 跳转至客户端的品牌团商品列表
         * @params
         * {"brandid":"222","dealid":[1111,23333,3333]}
         * brandid: 品牌id
         * dealid：商品id，数组格式，有1个或多个
         * */
        $.common.goto_brandlist=function(params){
            var param = {"methodname":"goto_brandlist","methodparam":params};
            $.callNative(param);
        };

        /*
         * 获取客户端是否支持某个urlscheme协议 
         * @params
         * {"urlkey":"22"}
         * urlkey: 表示为当前urlscheme key值 
         * 所有urlscheme列表地址：http://wiki.tuan800-inc.com/display/bjwxfwptb1/urlscheme_list 
         * callback: 客户端返回值，为number类型，0 表示支持，1表示不支持
         * */
        $.common.issupport_scheme=function(params,callback){
            var param = {"methodname":"issupport_scheme","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 向客户端发送统计数据,用于页面流转统计
         * @params
         * {"pos_type":"页面名称","pos_value":"页面id","model_item_index":"模块内元素索引","model_name":"模块名称","model_index":"模块索引","model_id":"模块id"} 
         * */
        $.common.tracklogs=function(params){
            var param = {"methodname":"tracklogs","methodparam":params};
            $.callNative(param);
        };

          /*
         * 分享控件v2版，此协议为通用方法，不局限在某一个页面内
         * @param 数组结构，每个对象内提供分享的渠道和所需数据，具体如下：
         * share_platform：标示分享的渠道，1是微信，2是朋友圈 ，3是新浪微博，4是qq好友，5是qq空间，6是链接
         * dtype: 表示分享所需的数据类型，0 表示有title，content 等信息；1 表示只有图片信息
         * data 为当前渠道所需数据：
         * out_url:分享后的跳转url
         * content：分享的描述内容
         * title：分享的标题
         * small_img：分享的缩略图地址
         * big_img : 大图url，可为带有二维码的图片url，如“微信朋友圈”
         * source:表示分享的来源
         * _ga:统计需要传的参数
         * callback: 客户端的回调，带有返回值 为number数据  0表示成功，1表示失败
         [
             {
              "share_platform":"1",
              "data":{
                "out_url":"http://m.zhe800.com",
                "content":"这是测试文字内容",
                "title":"测试标题",
                "small_img":"http://i0.tuanimg.com/ms/zhe800h5/dist/img/detail_first.png",
                "source":"n",
                "_ga":{"key1":"val1","key2":"val2"...}
                }  
             },
            {
              "share_platform":"2",
              "dtype":"1"
              "data":{
                "small_img":"http://i0.tuanimg.com/ms/zhe800h5/dist/img/detail_first.png",
                "big_img":"http://p13.tuanimg.com/imagev2/trade/800x800.c1d98483b1126467e0d1c7d2a00127ef.400x.jpg",
                "source":"n",
                "_ga":{"key1":"val1","key2":"val2"...}
                }  
             }
         ]
         */

        $.common.sharev2=function(params,callback){
            var param = {"methodname":"openShareDialogv2","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        
        /*
        调起手机通讯录
        callback: 客户端的回调，将用户选择的手机号返回给 js ，如：{"phone":"15011111111"}
        */
        $.common.open_contacts=function(callback){
            var param = {"methodname":"open_contacts","callback":callback};
            $.callNative(param);
        };

        /*
         * 跳转至商品详情页包含（特卖商城、天猫、淘宝）v2 版
         * @params
         * {"id":"1091024","source_type":"1","hide_native_button":"true","out_url":"http://out.tao800.com/m/deal/1091024"}
         * id: 商品deal id 
         * source_type：商品类型：0：表示为 淘宝、天猫，1：表示为 特卖商城
         * out_url：最终跳转至商品详情的url，包含统计字段
         * hide_native_button：隐藏页面顶部右侧的工具栏（客户端默认显示），true 表示隐藏 ，false 表示显示
         * */
        $.common.to_detailv2=function(params){
            var param = {"methodname":"to_detailv2","methodparam":params};
            $.callNative(param);
        };

        /*
        * 打开找回密码界面
        * @params
        * {"isreload":"true/false","url":"http://h5.m.zhe800.com/index_zhe800.htm"}
        * isreload:找回密码后是否跳转至某个页面，true：跳转至指定页面，false：刷新当前页面
        * url：需要跳转的 url 地址
        * */
        $.common.retrieve_password=function(params){
            var param = {"methodname":"retrieve_password","methodparam":params};
            $.callNative(param);
        };
        /*
         * 设置页面title（native titlebar）
         * @params
         * methodname： set_title
         * Methodparam:json string
         * {"title":"下单页"}
         * title: 页面title
         * callback: 空
         * */
        $.common.set_title=function(params){
            var param = {"methodname":"set_title","methodparam":params};
            $.callNative(param);
        };
        /*
         * 获取当前购物车中商品（已失效+未失效）  数量
         * @params
         * methodname： get_cart_num
         * Methodparam:json string
         * {"cart_num":"购物车中商品的数量"}
         * cart_num: 购物车中商品的数量
         * callback: 空
         * */
        $.common.get_cart_num=function(params){
            var param = {"methodname":"get_cart_num","methodparam":params};
            $.callNative(param);
        };
        /*
         * 通知客户端h5已收藏(或者取消收藏)商家店铺
         * @params
         * methodname： shop_favorite
         * Methodparam:json string
         * {"cmd":"to_favorite/cancel_favorite","sellerid":"w2314242"}
         * cmd: 通知客户端执行动作，to_favorite表示收藏，cancel_favorite表示取消收藏
         * sellerid : 店铺id
         * callback: 空
         * */
        $.common.shop_favorite=function(params){
            var param = {"methodname":"shop_favorite","methodparam":params};
            $.callNative(param);
        };
        /*
         * h5去往客户端绑定手机号页面
         * @params
         * {"isreload":"true/false","url":"http://h5.m.zhe800.com/index_zhe800.htm"}
         * isreload:登录后是否跳转至某个页面，true：跳转至指定页面，false：刷新当前页面
         * url：需要跳转的 url 地址
         * */
        $.common.bind_phone=function(params){
            var param = {"methodname":"bind_phone","methodparam":params};
            $.callNative(param);
        };
        /*
         * h5发送页面数据至客户端
         * @params
         * {"name":"shop","url":"http://h5.m.zhe800.com/index_zhe800.htm","info":{"sellerid":"661954","title":"XXX店铺"}}
         * name: 页面名称（如 商家店铺为shop）
         * url：页面的url
         * info: 页面数据（如店铺数据为{"sellerid":"661954","title":"XXX店铺"}）
         * */
        $.common.pageinfo=function(params){
            var param = {"methodname":"pageinfo","methodparam":params};
            $.callNative(param);
        };
        /*
         * 通知客户端收藏商品V2
         * @params
         * {"cmd":"to_favorite/cancel_favorite","dealid":"31244234","zid":"z123fffeferege"}
         * cmd:告诉客户端执行动作，to_favorite表示收藏，cancel_favorite表示取消收藏
         * dealid:商品的dealid
         * zid:商品的zid
         * callback：客户端的回调，带返回值：1表示成功，0表示失败
         * */
        $.common.favoritev2=function(params,callback){
            var param = {"methodname":"favoritev2","methodparam":params,"callback":callback};
            $.callNative(param);
        };
        /*
         * 通知客户端扫一扫
         * @params
         * callback：客户端的回调，返回的json数据
         * {"status":"1","result":"sdasdgadggajggd"}
         * status：1表示成功，0表示失败
         * result: 扫描后的结果
         * */
        $.common.rich_scan=function(callback){
            var param = {"methodname":"rich_scan","callback":callback};
            $.callNative(param);
        };

        /*
         * 获取商品收藏状态 V2
         * @params
         *  {"dealid":"31244234","zid":"z123fffeferege"}
         * dealid: 商品的dealid
         * zid:商品的zid
         * callback:客户端的回调，带返回值：1表示已收藏，0表示未收藏
         * */
        $.common.getfav_statusv2=function(params,callback){
            var param = {"methodname":"getfav_statusv2","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /*
         * 通知native返回上一级页面（关闭当前窗口）
         * methodparam："" 空
         * callback:"" 空
         * 使用场景：页面A中 有“返回”按钮，点击此按钮 通知native 关闭当前窗口，返回上一级页面。
         * */
        $.common.goback=function(){
            var param = {"methodname":"goback"};
            $.callNative(param);
        };
        
         /*
         * 发送页面分享信息给客户端，此方法为通用方法，不局限在某一个页面内
         * {"out_url":"http://m.zhe800.com","content":"这是测试文字内容","title":"测试标题","","pic_url":"http://i0.tuanimg.com/ms/zhe800h5/dist/img/detail_first.png","share_platform":"1,2"，"source":"n","_ga":{"key1":"val1","key2":"val2"...}}
         * out_url:分享url
         * content：分享的描述内容
         * title：分享的标题
         * pic_url：分享的图片url
         * share_platform:表示分享到的平台，1是微信，2是朋友圈 ，也可同时传入 1,2 表示同时显示两个平台，逗号隔开
         * source:表示分享的页面（int类型）参考  http://wiki.tuan800-inc.com/pages/viewpage.action?pageId=2641098 ；与 share_type字段保持一致
         * ga:统计需要传的参数
         * callback: 用户分享后客户端的回调，带有返回值 为{"result":0,"share_platform":""}
         * result:0分享失败  1分享成功
         * share_platform 标示分享的渠道，1是微信，2是朋友圈 ，3是新浪微博，4是qq好友，5是qq空间，6是链接
         * */
        $.common.open_share=function(params,callback){
            var param = {"methodname":"open_share","methodparam":params,"callback":callback};
            $.callNative(param);
        };

        /**
        通知h5 passport当前已安装的第三方
        methodname：get_thirdappstatus
        methodparam： {}
        callback: "1,2,3,4,5" 每个第三方都有自己的对应的编号 
        使用场景如：进入H5登陆页面页后，js发送此消息通知native 即可。
        **/
        $.common.get_thirdappstatus=function(callback){
            var param = {"methodname":"get_thirdappstatus","callback":callback};
            $.callNative(param);
        };
        /**
        通知native当前登陆状态
        methodname：set_status
        methodparam： {"ptype":"loginin","user_id":"xxx"}
        callback: "" 空 
        使用场景如：进入H5登陆页面页后，js发送此消息通知native 即可。    
        **/
        $.common.set_status=function(params){
            var param = {"methodname":"set_status","methodparam":params};
            $.callNative(param);
        };
        /**
         第三方登陆调起协议
         methodname：open_thirdApp
         methodparam： {"type":"1"} // 每个第三方都有自己的对应的编号 
         callback: "" //
         使用场景如：进入H5登陆页面页后，js发送此消息通知native 即可。
        **/
        $.common.open_thirdApp=function(params){
            var param = {"methodname":"open_thirdApp","methodparam":params};
            $.callNative(param);
        };
    })(Zepto);
});
