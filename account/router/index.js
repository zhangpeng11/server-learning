var index = require('../controller/index');
var edit =  require('../controller/edit');
var chart = require('../controller/chart');
var passport = require('../controller/passport');

module.exports = function(app){
    //首页
    console.log('into router');
    app.get('/index',index.index);
    app.get('/getInfo',index.getInfo);
    app.get('/delInfo',index.delInfo);
    app.get('/getUserInfo', index.getUserInfo);
    app.get('/edit',edit.edit);
    app.get('/addInfo',edit.addInfo);
    app.get('/chart', chart.chart);
    app.get('/passport', passport.passport);
    app.get('/submit', passport.submit);
};
