/*
* 订单管理配置文件
*
* */
var rootdomain="//i0.tuanimg.com/ms/zhe800m/";
var _dir="dist";

seajs.config({
    base: rootdomain,
    paths:{
        "zepto":"libs/zepto"
    },
    alias: {
        "zepto": "zepto/zepto/1.0.0/zepto"
    },
    map: [
        [ /^(.*\/dist\/src\/.*\.(?:css|js))(?:.*)$/i, '$1?v1.0.7']
    ]
});
seajs.use(rootdomain +_dir+"/src/order/order_detail");