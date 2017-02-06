/**
 * Created by Administrator on 2016/10/21.
 */
var bodyWidth = $(window).width();

var account = {

    getInfo:function (){
        $.ajax({
            type: "get",
            url: "./getInfo",
            data:{id:1},
            success: function(data){
                var listHtmlStr = '<ul class="account_list">';
                if(data && data.length>0){
                    data.forEach(function(item){
                        var money = item.money,
                            id = item.id,
                            date = item.date.substr(0,10),
                            type = item.type,
                            name = item.account_name;
                        listHtmlStr += '<li class="account_item" data-id='+id+'><div class="slide"><span class="account_type type'+type+'"></span>';
                        switch(type){
                            case 1:
                               listHtmlStr +=  '<span class="account_name">transport</span>';
                                break;
                            case 2:
                                listHtmlStr +=  '<span class="account_name">clothse</span>';
                                break;
                            case 3:
                                listHtmlStr +=  '<span class="account_name">food</span>';
                                break;
                            case 4:
                                listHtmlStr +=  '<span class="account_name">shopping</span>';
                                break;
                            case 5:
                                listHtmlStr +=  '<span class="account_name">hotel</span>';
                                break;
                            case 6:
                                listHtmlStr +=  '<span class="account_name">income</span>';
                                break;
                            default:
                                listHtmlStr +=  '<span class="account_name">else</span>';
                        }
                        if(money > 0){
                            listHtmlStr += '<span class="account_num add">'+ money +'</span>';
                        }
                        else{
                            listHtmlStr += '<span class="account_num reduce">'+ money +'</span>';
                        }
                        listHtmlStr += '<span class="account_date">'+date+'</span></div><div class="editDom"><span class="writeBtn"></span><span class="delBtn"></span></div></li>';
                    });
                    listHtmlStr += '</ul>';
                }
                else{
                    var listHtmlStr = '<div class="no_info"><p>还没有您的消费信息呢，赶快去记录吧</p></div>';
                }
                $('#ct').append(listHtmlStr);
                $(".account_item").on("click", function(){
                    var editDom = $(this).children(".editDom");
                    var slide = $(this).children(".slide");
                    var left = $(this).css("margin-left");
                    if(left == "-100px"){
                        $(this).css("margin-left","0px");
                    }
                    else{
                        $(this).css("margin-left","-100px");
                        //editDom.show();
                    }
                    //editDom.toggle();
                });
                $(".writeBtn").on("click",function(){
                    window.location.href = "./edit";
                });
                $(".edit_icon").on("click",function(){
                    window.location.href = "./edit";
                });
                $(".tab_icon").on("click",function(){
                    var body = $("body");
                    var left = body.css("margin-left");
                    if(left == "267px"){
                        body.css("margin-left","0px");
                    }
                    else{
                        body.css("margin-left","267px");
                    }
                });
                $(".delBtn").on("click",function(){
                    var id = $(this).parents(".account_item").attr("data-id")
                    account.deleteInfo(id);
                });
            },
            timeout: 2000,
            error: function(err){
                console.log('请求失败');
            }
        });
    },

    getUserInfo: function(){
        var mail_address = window.sessionStorage.getItem("mail_address");
        //var password = window.sessionStorage.getItem("password");
        if(mail_address){
            $.ajax({
                type:"GET",
                url: "./getUserInfo",
                data:{mail_address: mail_address},
                success: function(data){
                    if(data){
                        var name = data.name,
                            head_pic = data.head_pic;
                        $(".head_pic").css("background-image","url("+head_pic+")");
                        $(".user_name").text(name);
                    }
                    else{
                        console.log("userInfo error");
                    }
                },
                timeout: 3000,
                error: function(err){
                    console.log("error");
                }
            });
        }
    },

    deleteInfo: function(id){
        if(id){
            $.ajax({
                type:"GET",
                url: "./delInfo",
                data: {id:id},
                success: function(data){
                    if(data){
                        if(data.status == "success"){
                            var account_list = $(".account_item");
                            account_list.each(function(index, item){
                                if(item.getAttribute("data-id") == id){
                                    item.remove();
                                }
                            });
                        }
                        else{
                            console.log("未查到");
                        }
                    }
                },
                timeout: 10000,
                error: function(err){
                    console.log("删除失败");
                }
            });
        }
    },


    init:function(){
        //$("body").width(bodyWidth);
        this.getInfo();
        this.getUserInfo();
        $(".head_pic").on("click", function(){
            window.location.href = "./passport";
        });
        $(".chart").on("click",function(){
            window.location.href = "./chart";
        });
    }
};

account.init();
