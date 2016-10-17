/*
 *
 * biaojs*/

define(function(require,exports,module){

    //表单验证
    exports.checkInput=function(arr){
        var err_msg = $(".err_msg");
        var ischeck = true;
        for(var i=0;i<arr.length;i++){
            var _thisinput = $(arr[i]);
            var par_li = _thisinput.parent().parent();
            var _regstr = _thisinput.attr("reg");
            var _msg = '';
            var _val  = _thisinput.val().replace(/[\s]/g,'');
            if(par_li.css("display")!='none'){
                if(_regstr){
                    var _regarr = _regstr.split("#");
                    _msg = _thisinput.attr("msg").split("#");
                    for(var sj=0;sj<_regarr.length;sj++){
                        var re = new RegExp(_regarr[sj].replace(/\\\\/g,"\\"));
                        if(!re.test(_val)){
                            ischeck=false;
                            $.zheui.toast(_msg[sj]);
                            // console.log(_msg[sj]);
                            break;
                        }
                    }
                    if(!ischeck){
                        return false;
                    }
                }else{
                    _msg = _thisinput.attr("msg");
                    if(_msg && _val==''){
                        $.zheui.toast(_msg);
                        // console.log(_msg);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    //获取用户输入的内容
    exports.getInputVal=function(arr){
        var vals = '';
        $(arr).each(function(){
            if($(this).val()!=''){
                vals += "&"+$(this).attr("name")+"="+$(this).val();
            }
        });
        vals = vals.substring(1,vals.length);
        return vals;
    }
    //判断选择原因是否需要上传凭证
    exports.checkReason=function(id,arr,pic){
        var ischeckreason=true;
        for(var i=0;i<arr.length;i++){
            if(arr[i]==id&&pic.length==0){
                ischeckreason=false;
                break;
            }
        }
        console.log(ischeckreason);
        if(!ischeckreason){
             $.zheui.toast("您选择的原因需上传凭证");
            return false;
        }
        return true;
    }

});