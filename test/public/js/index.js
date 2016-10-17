/**
 * Created by Administrator on 2016/10/14.
 */
//ÅÐ¶ÏµÇÂ¼×´Ì¬
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

            //leftBar.append('<div class="photo"><div class="photoContain"><img href="'+_this.info.phoneUrl+'"/></div><div class="phoneInfo"><span class="name">'+_this.info.name+'</span><span class="job">'+_this.info.job+'</span></div></div>'+
            //'<div class="personInfo"><ul></ul></div>');
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
                console.log("ÑéÖ¤µÇÂ½½Ó¿Ú³ö´í");
            }
        });
    },
};