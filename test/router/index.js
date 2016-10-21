var index = require('../controller/index');
var login = require('../controller/login');
module.exports = function(app){
    //首页
    app. get('/',index.index);
    app.get('/login',index.login);
    app.get('/index/islogin',index.islogin);
};
