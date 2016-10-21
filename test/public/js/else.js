/**
 * Created by Administrator on 2016/10/14.
 */
//判断登录状态
var status = false;

var person = {
    info: {
        id: 0,
        name:"",
        job:""
    },

    init: function(){
        var _this = this;
        isLogin();
    },

    getPersonInfo: function(id){
        $.ajax({
            type: "GET",
            url: "/",
            data:{id:id},
            success: function(data){
                //_this.info.name = data.name;
                //_this.info.imgUrl = data.imgUrl;
                //_this.info.schoolName = data.schoolUrl;
                //_this.info.phoneNum = data.phoneNum;
                //_this.info,address = data.address;
                _this.info = data;
                $('.name').text = data.name;
                $('.school_name').text = data.school_name;
                $('.phone_name').text = data.phone_name;
                $('.email_address').text = data.email_address;
                $('.address_name').text = data.address_name;
            },
            timeout: 10000,
            error: function(err){

            }
        });
    },

    renderPersonInfo: function(){
        var leftBar = $("#leftBar");
        var context = $("#context");
        if(status){
            //var photo = $(".photo");
            //var personInfor = $(".personInfo");
            //var character = $(".character");
            //var hobit = $(".hobit");

            //leftBar.append('<div class="photo"><div class="photoContain"><img href="'+_this.info.phoneUrl+'"/></div></div>'+
            //'<div class="personInfo"><div class="baseInfo"><span class="user_icon"></span><span class="name">'+_this.info.name+'</span><span class="job">'+_this.info.job+'</span></div>'+
            //    '<ul class="base_list"><li><div class="school"><p>毕业院校</p><p class="school_name">_this.info.schoolName</p></div></li>'+
            //    '<li><div class="phone"><p>phone</p><p class="phone_num">_this.info.phoneNum</p></div></li>'+
            //    '<li><div class="email"></div></li></ul></div>');
        }
        else{

        }
    },

    isLgoin: function(){
        $.ajax({
            type: "GET",
            url: "/islogin",
            success: function(data){
                var loginData = data;
                if(loginData.status  && loginData.id){
                    status = true;
                    _this.id = id;
                    getPersonInfo(_this.id);
                }
                renderPersonInfo();
            },
            timeout: 10000,
            error: function(err){
                console.log("验证登陆接口出错");
            }
        });
    },
};