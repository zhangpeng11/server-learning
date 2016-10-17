/*
* 搜索方法
* */

define(function(require,exports,module){
    var $ = require("zepto");
    require('../common/base');
    //o:input
    function m800_search(){
        //获取搜索历史记录和自动匹配
        this.get_data = function(){
            console.log("==get_data==");
            $(".category_w").hide();
            var that = this;
            var input_val = $("#search_input").val().trim();
            if(input_val.length == 0){
                if(localStorage.search_history != undefined || localStorage.search_history != null){

                    var search_arr = localStorage.search_history.split(",");
                    var html = "";
                    html += "<ul>";
                    html += "<li class='icon'><i></i>搜索历史记录</li>";
                    for(var i=0; i<search_arr.length; i++){
                        html += "<li><span data_url='"+$.zheui.domain+"/m/sou/soulist?key="+encodeURI(search_arr[i])+"'>"+search_arr[i]+"</span></li>";
                    }
                    html += "<li id='search_clear'>清除历史记录</li>";
                    html += "</ul>";
                    $(".search_result").html("").append(html).show();
                    $('.index_w').hide();
                    //清除历史记录
                    $.zheui.bindTouchGoto($("#search_clear"),function(){
                        that.clear();
                    });
                    //li选项点击
                    $.zheui.bindTouchGoto($(".search_result ul li"),function(o){
                        var s_word = o.text();
                        that.save_arr(s_word);
                        var to_url = o.find("span").attr("data_url");
                        window.location.href = to_url;
                        $(".search_result").hide();
                        $('.index_w').show();
                        $(".category_m").show();
                    });

                }else{
                   $('.index_w').show(); 
                }
            }else{
                var patt = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");
                if(patt.test(input_val)){
                    $("#search_close").show();
                    $.ajax({
                        type: "GET",
                        url: "//m.api.zhe800.com/v2/suggestion?page=1&per_page=5&callback=?&q="+encodeURI(input_val),
                        dataType:"jsonP",
                        success: function (data) {
                            if(data.length > 0){
                                var html = "";
                                var data_length = data.length>5?5:data.length;
                                html += "<ul>";
                                for(var i=0; i<data_length; i++){
                                    html += "<li><span data_url='"+$.zheui.domain+"/m/sou/soulist?key="+encodeURI(data[i].word)+"'>"+data[i].word+"</span></li>";
                                }
                                html += "</ul>";
                                $(".search_result").html("").append(html).show();
                                $('.index_w').hide();
                                //li选项点击
                                $.zheui.bindTouchGoto($(".search_result ul li"),function(o){
                                    var s_word = o.text();
                                    that.save_arr(s_word);
                                    var to_url = o.find("span").attr("data_url");
                                    window.location.href = to_url;
                                    $('.index_w').show();
                                    $(".search_result").hide();
                                    $(".category_m").show();
                                });
                            }else{
                                $(".search_result").html("").hide();
                            }
                        }
                    })
                }else{
                    $.zheui.toast("请输入数字、字母或汉字");
                    return;
                }
            }
        };

        //存储数组
        this.save_arr = function (o) {
            if(localStorage.search_history == null){
                var arr = [];
                arr.unshift(o);
            }else{
                var arr = localStorage.search_history.split(",");
                for (var i = 0; i < arr.length; i++) {
                    if (o == arr[i]) {
                        arr.splice(i, 1);
                    }
                }
                var arr_num = arr.unshift(o);
                if (arr_num > 10) {
                    arr.pop();
                }
            }
            arr_str = arr.join(",");
            localStorage.search_history = arr_str;
        };

        //搜索按钮
        this.search_btn = function(){
            console.log("==search_btn==");
            var input_val = $("#search_input").val().trim();
            if(input_val.length == 0){
                $.zheui.toast("请输入关键字");
            }else{
                var patt = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");
                if(patt.test(input_val)){
                    this.save_arr(input_val);
                    $(".search_result").hide();
                    window.location.href = "/m/sou/soulist?key="+encodeURI(input_val);
                }else{
                    $.zheui.toast("请输入数字、字母或汉字");
                    return;
                }
            }
        };
        this.adapt = function(){
            $("#search_input").val('');
            var version = $.zheui.versions(navigator.userAgent),
                ele = $('#search_input');
            if (version == 'iphone') {
                ele.css('line-height','25px');
            }else if(version == 'android'){
                ele.css('line-height','24px');
                ele.css('height','24px');
            }
        };
        //清空历史记录
        this.clear = function(e){
            console.log("==clear==");
            localStorage.removeItem("search_history");
            $('.index_w').show(); 
            setTimeout(function(){
                $(".search_result").hide();
                 $(".category_w").show();
            },200);
        };

        //关闭
        this.close = function(){
            console.log("==close==");
            $(".search_result").hide();
        };

        //失去焦点
        this.blurr = function(){
            console.log("==blurr==");
            var input_val = $("#search_input").val().trim();
            //if(input_val.length == 0){
                setTimeout(function(){
                    $(".search_result").hide();
                    $('#index_topbar').find('.search').css({'width':'60%','left':'25%'});
                    $('#index_topbar').find('.logo').show();
                    $('#index_topbar').find('.user_in').show();
                    $('#index_topbar').find('#e_aboragte').hide();
                     $("#search_close").hide();
                     $('.index_w').show();
                     $("#search_input").blur();
                },200);
            //}
        };
    }
    module.exports=m800_search;

});