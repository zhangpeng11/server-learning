var database = require('./common/dataBaseHelper');

module.exports = {

    index: function *(){
        yield this.render('index', {
            title: "index"
        });
    },

    getInfo: function *(next){
        var data = yield database.getById("userInfo",this.query.id);
        console.log("result:" + JSON.stringify(data));
        if(data){
            this.body = data;
        }

    }
}