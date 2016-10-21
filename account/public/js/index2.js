/**
 * Created by Administrator on 2016/10/21.
 */

var account = {

    getInfo:function (){
        $.ajax({
            type: "get",
            url: "./getInfo",
            data:{id:1},
            success: function(data){
                if(data && data.length>0){
                    var listHtmlStr = '<ul class="account_list">';
                    data.forEach(function(item){
                        var money = item.money,
                            date = item.date,
                            type = item.type,
                            name = item.account_name;
                        listHtmlStr += '<li class="account_item"><div><span class="account_type"'+type+'></span><span class="account_num">'+name+'" "'+ money +'</span><span class="account_date">'+date+'</span></div></li>';
                    });
                    listHtmlStr += '</ul>';
                    $('#ct').append(listHtmlStr);
                }
                else{
                    var listHtmlStr = '<div class="no_info"><p>还没有您的消费信息呢，赶快去记录吧</p></div>';
                }
            },
            timeout: 2000,
            error: function(err){
                console.log('请求失败');
            }
        });
    },

    init:function(){
        this.getInfo();
    }
};

account.init();
