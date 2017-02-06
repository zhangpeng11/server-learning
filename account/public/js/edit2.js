/**
 * Created by Administrator on 2016/10/25.
 */
var temp_num = 0;
var arg_obj = {
    arg_num_temp:0,
    arg_num: 0,
    arg_mark_temp: "",
    arg_mark: "",
    start: false
};
//var calculate_str = "";

function bindClickEvent(item, callback){
    item.on("click", callback);
 }
 function addInfo(){
     var money = $(".calculate_num").text();
     var type = $(".calculate_item").attr("data-type");
    $.ajax({
        type:"GET",
        url:"./addInfo",
        data:{
            money: money,
            type: type
        },
        success: function(data){
            if(data){
                alert("add success");
            }
        },
        timeout:2000,
        error: function(err){
            console.log("add error");
        }
    });
}
function closeEdit(){
    window.location.href = "./index"
}
function changeItem(){
    var item = $(this).attr("data-name");
    var type = $(this).attr("data-type");
    $(".calculate_item").html("");
    $(".calculate_num").text("0");
    var htmlStr = '<span class="calculate_icon '+item+'"></span><span class="calculate_name">'+item+'</span>';
    $(".calculate_item").append(htmlStr);
    $(".calculate_item").attr("data-name",item);
    $(".calculate_item").attr("data-type",type);
}
function changeNum(){
    var className = $(this).attr("class");
    if(className == "clear"){
        $(".calculate_num").text("0");
        arg_obj.arg_num_temp = 0;
        arg_obj.arg_num = 0;
        arg_obj.arg_mark_temp = "";
        arg_obj.arg_mark = "";
        arg_obj.start = false;
        temp_num = 0;
    }
    else if(className == "back"){
        if(arg_obj.start){
            arg_obj.arg_num = Math.floor(arg_obj.arg_num/10);
            $(".calculate_num").text(arg_obj.arg_num);
        }
        else{
            temp_num = Math.floor(temp_num/10);
            $(".calculate_num").text(temp_num);
        }
    }
    else if(className == "opation"){
        //$(".calculate_num").text("0");
        //if(!arg_obj.start){
        //    arg_obj.arg_num = arg_num_temp;
        //    arg_obj.arg_mark = $(this).text();
        //    arg_obj.start = true;
        //}
        //else{
        //    console.log("arg_obj.arg_num: " + arg_obj.arg_num+" arg_num_temp: "+arg_num_temp);
        //    if(arg_obj.arg_mark == '+'){
        //        arg_obj.arg_num += arg_num_temp;
        //    }
        //    else if(arg_obj.arg_mark == '-'){
        //        arg_obj.arg_num -= arg_num_temp;
        //    }
        //    else if(arg_obj.arg_mark == '*'){
        //        arg_obj.arg_num *= arg_num_temp;
        //    }
        //    else if(arg_obj.arg_mark == '/'){
        //        arg_obj.arg_num /= arg_num_temp;
        //    }
        //    else if(arg_obj.arg_mark == '='){
        //        arg_obj.arg_num = arg_num_temp;
        //    }
        //    arg_obj.arg_mark = $(this).text();
        //}
        //arg_obj.first = true;
        //arg_num_temp = arg_obj.arg_num;
        //if($(this).text() == '='){
        //    $(".calculate_num").text(arg_num_temp);
        //}
        //arg_num_temp = 0;
        // $(".calculate_num").text("0");
        arg_obj.arg_mark_temp = $(this).text();
        arg_obj.arg_num_temp = temp_num;
        temp_num = 0;
        console.log("arg_obj.arg_num_temp: "+arg_obj.arg_num_temp+" arg_obj.arg_num: "+arg_obj.arg_num+" arg_obj.arg_mark_temp: "+arg_obj.arg_mark_temp+" arg_obj.arg_mark: " + arg_obj.arg_mark);

        if(!arg_obj.start){
            arg_obj.arg_num = arg_obj.arg_num_temp;
            arg_obj.start = true;
        }
        else{
            if(arg_obj.arg_mark == '+'){
                arg_obj.arg_num += arg_obj.arg_num_temp;
            }
            else if(arg_obj.arg_mark == '-'){
                arg_obj.arg_num -= arg_obj.arg_num_temp;
            }
            else if(arg_obj.arg_mark == '*'){
                arg_obj.arg_num *= arg_obj.arg_num_temp;
            }
            else if(arg_obj.arg_mark == '/'){
                arg_obj.arg_num /= arg_obj.arg_num_temp;
            }
        }

        arg_obj.arg_mark = arg_obj.arg_mark_temp;
        $(".calculate_num").text(arg_obj.arg_num);
    }
    else if(className == "dot"){

    }
    else if(className == "sum"){
        arg_obj.arg_num_temp = temp_num;
        temp_num = 0;
        if(arg_obj.start){
            arg_obj.arg_num += 0;
            arg_obj.start = false;
        }
        else{
            arg_obj.arg_num = arg_obj.arg_num_temp;
        }
    }
    else{
        //if(arg_obj.first){
        //    arg_num_temp = 0;
        //    arg_obj.first = false;
        //}
        //var num = $(this).text();
        //arg_num_temp = parseInt(num) + arg_num_temp * 10;
        //if(arg_num_temp > 10000000){
        //    alert("num is too large");
        //}
        //else{
        //    $(".calculate_num").text(arg_num_temp);
        //}

        var key_num = $(this).text();
        temp_num = parseInt(key_num) + temp_num * 10;
        $(".calculate_num").text(temp_num);

    }
}

bindClickEvent($(".cate_item"), changeItem);
bindClickEvent($(".keyboard td"), changeNum);
bindClickEvent($(".sendBtn"), addInfo);
bindClickEvent($(".cancel_icon"), closeEdit);