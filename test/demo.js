var wrapper = require('co-mysql'),
    mysql = require('mysql');
var options = {
    host : 'localhost',
    port : 3306 ,
    database : 'form_data',
    user: 'root',
    password : '123'
};

var pool = mysql.createPool(options),
    p = wrapper(pool);
var rows = yield p.query('SELECT 1');
yield this.render('index', {
    title: rows[0].fieldName
});
