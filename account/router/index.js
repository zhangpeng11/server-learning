var index = require('../controller/index');
module.exports = function(app){
    //首页
    console.log('into router');
    app.get('/index',index.index);
    app.get('/getInfo',index.getInfo);
};
