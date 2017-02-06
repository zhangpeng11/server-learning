/**
 * Created by Administrator on 2016/10/13.
 */
var database = require('./common/dataBaseHelper');
module.exports = {

    edit: function *(){
        yield this.render('edit', {
            title: "edit"
        });
    },
    addInfo: function *(){
        var that = this;
        if(that.query.type && that.query.money){
            this.body = yield new Promise(function(resolve, reject){
                database.addObject('userInfo', that.query.money, that.query.type, function(data){
                    if(data){
                        if(data.affectedRows > 0){
                            resolve({status: "success"});
                        }
                        else{
                            reject({status: "fail"});
                        }
                    }
                    else{
                        reject("������");
                    }
                });
            });
        }
        else{
            console.log("���ͻ���Ϊ��");
            this.body ={status:"fail"}
        }
    }
};