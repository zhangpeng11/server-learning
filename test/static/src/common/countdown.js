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
        var end_time=new Date(endtime).getTime();
        var now_time='';
        if(nowtime != undefined && nowtime!=''){
            now_time=new Date(nowtime);
        }else{
            now_time=new Date();
        }
        var second_left = (end_time - now_time)/1000;
        var timer = setInterval(function(){
            if(second_left >= 0){
                var day = Math.floor((second_left/3600)/24);
                var hour = Math.floor((second_left/3600)%24);
                var minute = Math.floor((second_left/60)%60);
                var second = Math.floor(second_left%60);
                hour = hour<10 ? "0"+hour : hour;
                minute = minute<10 ? "0"+minute : minute;
                second = second<10 ? "0"+second : second;
                --second_left;
                if(type==1){
                    _ele.text(day+"天"+hour+"小时"+minute+"分"+second+"秒");
                }else if(type==2){
                    _ele.text(hour+"小时"+minute+"分"+second+"秒");
                }else if(type==3){
                    _ele.text(minute+"分"+second+"秒");
                }

            }else{
                clearInterval(timer);
                if(typeof callback=="function"){
                   callback();
                }
            }
        },1000);
    }
});
