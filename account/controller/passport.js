/**
 * Created by Administrator on 2016/11/1.
 */
var database = require("./common/dataBaseHelper");
module.exports = {

    passport: function *() {
        yield this.render('passport', {
            title: "passport"
        });
    },

    submit: function* (){
        var that = this;
        this.body  = yield new Promise(function(resolve, reject){
            database.getObject("userlist", {mail_address: that.query.mail_address}, function(data){
                if(data){
                    var password = data.password;
                    if(password == that.query.password){
                        resolve({status: "success"});
                    }
                    else{
                        resolve({status: "fail", errCode:1});
                    }
                }
                else{
                    resolve({status: "fail", errCode:2});
                }
            });
        });
    }
}