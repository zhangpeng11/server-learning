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
                    //�������2��ʾ�û����벻��ȷ
                    this.body = {status: false, errCode: 2}
                }
            }
            else{
                //�������3��ʾ�޴��û�
                this.body = {status: false, errCode: 3}
            }
    },

    islogin: function*(){

    }
}