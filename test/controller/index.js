var wrapper = require('co-mysql'),
    mysql = require('mysql');
var options = {
    host : 'localhost',
    port : 3306 ,
    database : 'test',
    user: 'root',
    password : 'rootroot'
};

module.exports = {

    index: function*(){
        yield this.render('index',{"title":"index"});
    },

    islogin: function*(){

    }
}