/*
* 售后维权配置文件
*
* */
var rootdomain="//i0.tuanimg.com/ms/zhe800m/";
var _dir="dist";
// if(location.href.indexOf("?dev") > 0){
//     rootdomain="../../";
//     _dir="static";
// }
seajs.config({
    base: rootdomain,
    paths:{
        "zepto":"libs/zepto"
    },
    alias: {
        "zepto": "zepto/zepto/1.0.0/zepto"
    },
    map: [
        [ /^(.*\/static\/src\/.*\.(?:css|js))(?:.*)$/i, '$1?v1.1.0']
    ]
});
seajs.use(rootdomain +_dir+"/src/service/service");