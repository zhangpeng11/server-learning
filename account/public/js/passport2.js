/**
 * Created by Administrator on 2016/11/2.
 */
    function submit(){
        var mail_address = $("input[name='mail_address']").val();
        var password = $("input[name='password']").val();
        $.ajax({
            type:"GET",
            url:"./submit",
            data:data,
            success: function(data){
                if(data){
                    var status = data.status;
                    var errCode = data.errCode;
                    if(status == "success"){
                        window.sessionStorage.setItem("mail_address",mail_address)
                        window.location.href = "./index";
                    }
                    else if(status == "fail"){
                        if(errCode == 1){
                            alert("wrong password or mail_address");
                        }
                        else if(errCode = 2){
                            alert("mail_address is not exist");
                        }
                    }
                }
            },
            timeout: 2000,
            error: function(error){
                console.log(err);
            }
        });
    }


    function callAjax(url,callback){
        $.ajax({
            type:"GET",
            url:"./submit",
            data:data,
            success: function(data){
                if(data){
                    var status = data.status;
                    var errCode = data.errCode;
                    if(status == "success"){
                        window.sessionStorage.setItem("mail_address",mail_address)
                        window.location.href = "./index";
                    }
                    else if(status == "fail"){
                        if(errCode == 1){
                            alert("wrong password or mail_address");
                        }
                        else if(errCode = 2){
                            alert("mail_address is not exist");
                        }
                    }
                }
            },
            timeout: 2000,
            error: function(error){
                console.log(err);
            }
        });
    }


