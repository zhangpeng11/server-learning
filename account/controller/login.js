/**
 * Created by Administrator on 2016/10/13.
 */
module.exports = {
    login: function*(){
        yield this.render('login',{"title":"koa demo"});
    }
}