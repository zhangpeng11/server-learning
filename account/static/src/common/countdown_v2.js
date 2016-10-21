define(function(require,exports,module){

    /**
     * 倒计时模块
     * @param
     * time:传入的时间为字符串
     * type:倒计时显示的类型,为数字，1(n天 n小时 n分 n秒), 2(n小时 n分 n秒), 3(n分 n秒)
     * ele:需要显示在的dom元素
     * callback：倒计时完成后的回调
     */
    exports.countDown=function(endtime,nowtime,type,ele,callback){
        var _ele = $(ele);
        var end_date = new Date(endtime).getDate();
        var now_date = new Date(nowtime).getDate();
        var hours = new Date(endtime).getHours();
        var end_time=new Date(endtime).getTime();
        var now_time='';
        if(nowtime != undefined && nowtime!=''){
            now_time=new Date(nowtime).getTime();
        }else{
            now_time=new Date().getTime();
        }
        var second_left = end_time - now_time;
        var timer = setInterval(function(){
            if(second_left >= 0){
                var day=Math.floor(second_left/(1000 * 60 * 60 * 24));
                var hour=Math.floor(second_left/(1000*60*60)) % 24; //小时 
                var minute=Math.floor(second_left/(1000*60)) % 60; //分钟 
                var second=Math.floor(second_left/1000) % 60; //秒 
                hour = hour<10 ? "0"+hour : hour;
                minute = minute<10 ? "0"+minute : minute;
                second = second<10 ? "0"+second : second;
                second_left = second_left -100;
                if(type==1){
                    _ele.text(day+"天"+hour+"小时"+minute+"分"+second+"秒");
                }else if(type==2){
                    _ele.text(hour+"小时"+minute+"分"+second+"秒");
                }else if(type==3){
                    _ele.text(minute+"分"+second+"秒");
                }
                if(type == 4){
                    var myMS=Math.floor(second_left/100) % 10; //拆分秒
                    var sptime = Math.abs(parseInt(now_date) - parseInt(end_date));
                    hour = parseInt(hour) + parseInt(day*24);
                    hour = hour<10 ? "0"+hour : hour;
                    if(sptime == 0){
                        _ele.html("<span>今天"+ hours +"点开抢</span><span><i>"+ hour +"</i>:<i>"+ minute +"</i>:<i>"+ second +"</i>:<i>"+ myMS +"</i></span>");
                    }else{
                        if(sptime == 1){
                            _ele.html("<span>明天"+ hours +"点开抢</span><span><i>"+ hour +"</i>:<i>"+ minute +"</i>:<i>"+ second +"</i>:<i>"+ myMS +"</i></span>");
                        }else{
                            if(sptime < 4 ){
                                _ele.html("<span>"+ end_date +"日"+ hours +"点开抢</span><span><i>"+ hour +"</i>:<i>"+ minute +"</i>:<i>"+ second +"</i>:<i>"+ myMS +"</i></span>");
                            }else{
                                _ele.html("<span class = 'timeclass'>"+ end_date +"日"+ hours +"点开抢</span>");
                            }
                            
                        }
                    }
                }
            }else{
                clearInterval(timer);
                if(typeof callback=="function"){
                   callback();
                }
            }
        },100);
    }
});
