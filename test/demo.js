/**
 * Created by Administrator on 2016/9/22.
 */
var koa = require('koa');
var fs = require('fs');

function co(fn) {
    return function(done) {
        var ctx = this;
        var gen = fn.call(ctx);
        var it = null;
        function _next(err, res) {
            if(err) res = err;
            it = gen.next(res);
            //{value:function(){},done:false}
            if(!it.done){
                if(isGeneratorFunction(it.value)){
                    co(it.value).call(ctx,_next);
                }else{
                    it.value(_next);
                }
            }else{
                done && done.call(ctx);
            }
        }
        _next();
    }
}

function read(file) {
    return function(fn){
        fs.readFile(file, 'utf8', fn);
    }
}

function *gf1(){
    this.a = yield read('error.js');
}

function *gf2(){
    this.b = yield read('package.json');
}

co(function *(){
    yield gf1;
    yield gf2;
    console.log(this.a.length);
    console.log(this.b.length);
})();
app.listen(3000);