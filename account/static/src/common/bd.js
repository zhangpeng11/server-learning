/*
 * name:big data.js
 * intro:大数据js
 * version: v0.1
 * author: wangguanjia
 * date: 2016/04/14
 */
define(function(require, exports, module) {
    var bigData = {
        current_time: new Date().getTime(),
        begin_time: $.cookie.get("bd_begin_time") ? $.cookie.get("bd_begin_time") : $.cookie.get(this.current_time),
        bd_chart: $.cookie.get("bd_chart") ? $.cookie.get("bd_chart") : '000000000000000000000000000000',
        getGap: function() {
            var days = Math.abs((this.current_time - this.begin_time)) / (1000 * 60 * 60 * 24);
            return days;
        },
        changeStr:function(orignStr,start,end,changeStr){
            //orignStr:原始字符串，start,开始位置,end：结束位置,changeStr:改变后的字
            if(orignStr.charAt(start) == '0'){
                var bd_chart = orignStr.substring(0,start-1)+changeStr+orignStr.substring(end,orignStr.length);
                // 首页的大数据cookie
                $.cookie.set("bd_chart",bd_chart);
                // 精选预告的大数据cookie
                $.cookie.set("bd_chart_fm",bd_chart); 
            }else{
                return void 0;
            }
        },
        setChart: function() {
            var gap = this.getGap(),
                orignStr= this.bd_chart,
                start = gap,
                end = gap,
                changeStr= '1';
            this.changeStr(orignStr,start,end,changeStr);
        },
        init: function() {
            if($.cookie.get("bd_begin_time") == null){
                $.cookie.set("bd_begin_time",this.current_time)
            }
            if($.cookie.get("bd_chart") == null ){
                $.cookie.set("bd_chart",'000000000000000000000000000000');
                $.cookie.set("bd_chart_fm",'000000000000000000000000000000');
            }
            if($.cookie.get("bd_chart_fm") == null || $.cookie.get("bd_chart") != null ){
                $.cookie.set("bd_chart_fm",$.cookie.get("bd_chart"));
            }
            var gap = this.getGap();
            if (gap>0) {
                this.setChart(gap);
            }else{
                return void 0;
            }
        }
    }
    module.exports = bigData;
});