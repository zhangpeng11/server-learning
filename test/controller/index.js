var database = require('./common/dataBaseHelper');

module.exports = {

    index: function *(){
        yield this.render('index', {
            title: 'index'
        });
    },

    login: function *(next){
        var _this = this;
        var password = this.query.password;
        var data =  yield database.getById("userinfo",this.query.id);
        console.log("result:" + JSON.stringify(data));
            if(data[0]){
                if(data[0].password == _this.query.password){
                    this.body = {status: true};
                }
                else{
                    //错误代码2表示用户密码不正确
                    this.body = {status: false, errCode: 2}
                }
            }
            else{
                //错误代码3表示无此用户
                this.body = {status: false, errCode: 3}
            }
    },

    islogin: function*(){

    }
}