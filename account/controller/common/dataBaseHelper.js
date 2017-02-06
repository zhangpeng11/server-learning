/**
 * Created by Administrator on 2016/10/18.
 */
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

//ִ������sql���
function execQuery(sql, values, callback) {
    var errinfo;
    pool.getConnection(function(err, connection) {
        if (err) {
            errinfo = 'DB-��ȡ���ݿ������쳣��';
            console.log(errinfo);
            throw errinfo;
        } else {
            var querys = connection.query(sql, values, function(err, rows) {
                release(connection);
                if (err) {
                    errinfo = 'DB-SQL���ִ�д���:' + err;
                    console.log(errinfo);
                    //throw errinfo;
                    callback(err);
                } else {
                    callback(null,rows);
                }
            });
            console.log(querys.sql);
        }
    });
}

function release(connection) {
    try {
        connection.release(function(error) {
            if (error) {
                console.log('DB-�ر����ݿ������쳣��');
            }
        });
    } catch (err) {}
}

function execUpdate(sql, values, callback){
    execQuery(sql, values, function(err,result) {
        if (callback) {
            var affectedRows = 0;
            if (result) {
                affectedRows = result.affectedRows
            }
            callback({
                affectedRows: affectedRows
            });
        }
    });
}

//ִ��sql��䣬����Ӱ������
exports.update = function(sql, values, callback) {
    execUpdate(sql, values, callback);
}

//��ѯ��ҳ
exports.queryPage = function(sql, values, page, size, callback) {
    if (page > 0) {
        page--;
    } else {
        page = 0;
    }
    execQuery(sql + ' LIMIT ' + page * size + ',' + size, values, function(rresult) {
        var index = sql.toLocaleUpperCase().lastIndexOf(' FROM');
        sql = 'SELECT COUNT(*) count ' + sql.substring(index);
        execQuery(sql, values, function(cresult) {
            if (callback) {
                var pagenum = cresult[0].count / size;
                if (cresult[0].count % size > 0) {
                    pagenum++;
                }
                callback({
                    count: pagenum,
                    rows: rresult
                });
            }
        });
    });
}

exports.getById = function(tablename, id){
    return new Promise(function(resolve, reject){
        var values = {id:id};
        var sql = 'select * from ?? where ?';
        execQuery(sql,[tablename, values], function(err, rows){
            if(err){
                reject(err);
            }else{
                resolve(rows);
            }
        })
    });
}

//��ѯ����
exports.getObject = function(tablename, values, callback) {
    var sql = 'SELECT * FROM ?? WHERE ?';
    execQuery(sql, [tablename, values], function(err, result) {
        if (callback) {
            if (result && result.length > 0) {
                callback(result[0]);
            } else {
                callback(null);
            }
        }
    });
}

//���һ����¼
exports.addObject = function(tablename, money, type, callback) {
    var sql = 'INSERT INTO ?? SET ?';
    var date = new Date();
    var values = {name:"小明",money:money,date:date,type:type}
    execUpdate(sql, [tablename, values], callback);
}

//���¼�¼
exports.updateObject = function(tablename, values, id, callback) {
    var sql = 'UPDATE ?? SET ? WHERE ?';
    execUpdate(sql, [tablename,
        values, id
    ], callback);
}

//ɾ����¼
exports.deleteObject = function(tablename, id, callback) {
    var values = {id:id};
    var sql = 'DELETE FROM ?? WHERE ?';
    execUpdate(sql, [tablename, values], callback);
}

//��ѯȫ����¼
exports.selectAll = function(tablename) {
    return new Promise(function(resolve, reject){
        var sql = 'select * from ?? order by date asc';
        execQuery(sql,tablename, function(err, rows){
            if(err){
                reject(err);
            }else{
                resolve(rows);
            }
        })
    });
}