/*
 *
 *维权和发表留言专用js */

define(function(require,exports,module){
    var form=require("./form");
    require('./upload_pic');

    //维权申请
    function weiquanApply(){
        var _val = form.getInputVal($(".input_box").find("input,textarea"));
        $.zheui.loadingbar("show","请求中，请稍后...");
        $.ajax({
            type:"POST",
            url:"/orders/complain_m/save.json",
            data:_val,
            dataType:"json",
            success:function(data){
                console.log(data);
                var _data =data;
                if(typeof _data =="object"){
                    $.zheui.loadingbar("hide","请求中，请稍后...");
                    $.zheui.toast(_data.msg);
                    if(_data.ret == 0){
                        window.location.href = $.zheui.domain+"/orders/complain_m/detail?complain_id="+_data.data;
                    }
                }
            },
            timeout:20000,
            error:function(){
                console.log("网络异常");
                $.zheui.loadingbar("hide","请求中，请稍后...");
                $.zheui.toast("网络异常,请稍后再试.");
            }
        });
    }

    $.zheui.bindTouchGoto($("#submitWeiquan"),function(obj){
        var _this = obj;
        var inputs = $(".input_box").find("input,textarea");
        var reason_id=$("input[name='reason']").val();
        var evidence=$("input[name='evidence']").val();
        if(form.checkInput(inputs)&&form.checkReason(reason_id,reasonArr,evidence)){
            weiquanApply();
        }
    });

});