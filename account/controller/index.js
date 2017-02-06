var database = require('./common/dataBaseHelper');
var thunkify = require('thunkify');

module.exports = {

    index: function *(){
        yield this.render('index', {
            title: "index"
        });
    },

    getInfo: function *(next){
        var data = yield database.selectAll("userInfo");
        console.log("result:" + JSON.stringify(data));
        if(data){
            this.body = data;
        }

    },

    delInfo: function *(next){
        //var cb = function(data){
        //    if(data.affectedRows == 0){
        //        this.body = {status: "fail"}
        //    }
        //    else{
        //        this.body =  {status: "success"}
        //    }
        //}
        //var del = function(id){
        //    return function(cb){
        //        database.deleteObject("userInfo", id, function(data){
        //            cb(data);
        //        });
        //    }
        //}
        //var a = yield del(this.query.id);
        //a(cb);
        //var del = thunkify(database.deleteObject);
        //var del2 = function(id){
        //    return del("userInfo",id );
        //}
        //this.body = yield del2(this.query.id );
        //,function(data){
        //            if(data.affectedRows == 0){
        //                this.body = {status: "fail"}
        //            }
        //            else{
        //                this.body =  {status: "success"}
        //            }
        //        });
        //yield function(id){;
            //return function(){
            //    return database.deleteObject("userInfo",this.query.id, function(data){
            //        if(data.affectedRows == 0){
            //            this.body = {status: "fail"}
            //        }
            //        else{
            //            this.body =  {status: "success"}
            //        }
            //    });
            //}
        //}
        var that = this;
       this.body =  yield new Promise(function(resolve,reject){
            database.deleteObject("userInfo",that.query.id, function(data){
                if(data){
                    if(data.affectedRows == 0){
                        resolve({status: "fail"});
                    }
                    else{
                        resolve({status: "success"});
                    }
                }
                else{
                    reject("出错了");
                }
            });
        });
        console.log("result:" + JSON.stringify(this.body));
    },

    getUserInfo: function* (){
        var that = this;
        this.body = yield new Promise(function(resolve, reject){
            database.getObject("userList",that.query.mail_address, function(data){
                if(data){
                    resolve(data);
                }
                else{
                    reject("user Info null");
                }
            });
        });
    }


}