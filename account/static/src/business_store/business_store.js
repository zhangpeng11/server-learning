/**
 * 商家店铺
 */
define(function (require, exports, module) {
    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/imglazyload");
    var page_from=$.zheui.getUrlKeyVal("page_from")||"";//url获取页面来源
   /* var window_height=window.innerHeight;
    //设置商品的列表的最小高度
    var list_min_height=window_height-$("#store_top").height()-20;
    $("#store_GoodsList").css("min-height",list_min_height+"px");*/
    var shadow_width=Math.floor(($("#ct").width()-30)/2);
    var shadow_height=Math.floor(shadow_width*330/302);
    //获取商家信息
    var seller_id=JSON.parse(deal).seller_info.seller_id;//获取商家id
    var seller_name=JSON.parse(deal).seller_info.nick_name;//获取商家的名称
    var seller_sort = JSON.parse(deal).seller_info.proportion;//获取商家类别
    if(seller_sort){
        $('.store_info').before('<div class="business_img_gold"></div>');
    }else{
        $('.store_info').before('<div class="business_img_normal"></div>');
    }
    $(".store_name").html(seller_name);
    document.title=seller_name;
    var gee_bus_fav=function(seller_id){//获取商家优惠信息
       $.ajax({
           type: "GET",
           url: "/api/discount?seller_id=" + seller_id,
           dataType:"json",
           success: function (data) {
               if (data.result.code == 0) {
                   if (data.discountInfo != null) {
                       var youhui_info=[];
                       var youhui_type = data.discountInfo.type; //满减优惠类型
                       var youhui_rule = data.discountInfo.rule; //满减优惠数据
                       // [100-10,200-20,300-30]    满多少元，减多少元
                       // [100-10]          满多少元，减多少元，上不封顶
                       // [2-9,3-8,4-7]         满多少件，打多少折
                       // [2]                    满多少件－免邮，
                       // [200]              满多少元－免邮
                       switch(youhui_type){
                           case 1:
                               var t2_arr = youhui_rule.split(",");
                               var t2_100 = [],
                                   t2_10 = [];
                               for (var i = 0; i < t2_arr.length; i++) {
                                   var t2_arr_arr = t2_arr[i].split("-");
                                   t2_100.push(t2_arr_arr[0]);
                                   t2_10.push(t2_arr_arr[1]);
                               }
                               var sh_html = "";
                               for (var j = 0; j < t2_100.length; j++) {
                                   sh_html += "<div class='dianpu_div'><div class='dianpu_lbg'></div><div class='dianpu_mbg'>" + "满" + t2_100[j] + "元减" + t2_10[j] + "元"+"</div><div class='dianpu_rbg'></div></div>";
                               }
                               break;
                           case 2:
                               var t1_100_10 = youhui_rule.split("-");
                               var t1_100 = parseFloat(t1_100_10[0]);
                               var t1_10 = parseFloat(t1_100_10[1]);
                               var sh_html = "<div class='dianpu_div'><div class='dianpu_lbg'></div><div class='dianpu_mbg'>" + "满" + t1_100 + "元减" + t1_10 + "元，上不封顶"+"</div><div class='dianpu_rbg'></div></div>";
                               break;
                           case 3:
                               var t2_arr = youhui_rule.split(",");
                               var t2_100 = [],
                                   t2_10 = [];
                               for (var i = 0; i < t2_arr.length; i++) {
                                   var t2_arr_arr = t2_arr[i].split("-");
                                   t2_100.push(t2_arr_arr[0]);
                                   t2_10.push(t2_arr_arr[1]);
                               }
                               var sh_html = "";
                               for (var j = 0; j < t2_100.length; j++) {
                                   sh_html += "<div class='dianpu_div'><div class='dianpu_lbg'></div><div class='dianpu_mbg'>" + "满" + t2_100[j] + "件打" + t2_10[j] + "折"+"</div><div class='dianpu_rbg'></div></div>";
                               }
                               break;
                           case 4:
                               var sh_html = "<div class='dianpu_div'><div class='dianpu_lbg'></div><div class='dianpu_mbg'>" + "满" + youhui_rule + "件免邮"+"</div><div class='dianpu_rbg'></div></div>";
                               break;
                           case 5:
                               var sh_html = "<div class='dianpu_div'><div class='dianpu_lbg'></div><div class='dianpu_mbg'>" + "满" + youhui_rule + "元免邮"+"</div><div class='dianpu_rbg'></div></div>";
                               break;
                       }
                       $(".store_favourable").html(sh_html);
                   }
               }
               if($(".store_favourable").height()==0){
                   $(".store_info").css("padding-top","12px");
               }
               if($(".store_favourable").height()>32){
                   $(".fav_more").show();
               }
           },
           timeout:20000,
           error:function(data) {
              console.log(data);
               $(".store_info").css("padding-top","12px");
           }
       });
    };
    gee_bus_fav(seller_id);
    //获取列表数据
    var id,short_title,sales_count,sales_img,list_price,active_price,sales_img_arr,allowance_price,activity_type,status;
    var store_list={
      nextpage: true,
      curPage: 1,
      isload: false
    };
    function toDecimal(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        var s = f.toString();
        var rs = s.indexOf(".");
        var z = parseInt(f), y = 0;
        if (rs > 0) {
            y = parseFloat("0." + s.split(".")[1]);
        }
        f = Math.round(z * 100 + y * 100) / 100;
        return f;
    }
    store_list.init = function(o, sellerid){
        var url="/api/getproductdetailbysellerid?curPage="+o+"&count=20&sellerid="+sellerid;
        if(page_from="xsq"){
            url+="&dealid="+$.zheui.getUrlKeyVal("id")||"";
        }
        if(o==1){
            $("#loading").show();//加载成功后隐藏正在加载图标
        }
        store_list.isload = true; //是否正在加载中
        $.ajax({
            type: "GET",
            url: url,
            success: function (data) {
                 if(typeof  data=="object"){
                     var dataList=data.productProfile.productProfileList;
                     if(data.productProfile.hasOwnProperty("productProfileList")&&data.productProfile.productProfileList.length){
                         store_list.nextpage = data.meta.hax_next;
                         store_list.curPage = o;
                          o == 1 ? $("#loading").hide() : $("#loading_more").hide();
                          var load_img = "//i0.tuanimg.com/ms/zhe800h5/dist/img/business_store/img_placehd.jpg";
                          var productList_ul="";
                           productList_ul+=" <ul class=\"store_ul\">";
                          for(var i=0;i<data.productProfile.productProfileList.length;i++){
                            id=dataList[i].Id;//商品id
                            short_title=dataList[i].name;//商品名称
                            list_price=Math.floor(dataList[i].price);//商品原价
                            active_price=dataList[i].activePrice;//活动价
                            sales_count=dataList[i].salesCount;//销量
                            sales_img_arr=dataList[i].imgKey;//每个商品所有类型的图片
                            allowance_price=dataList[i].allowancePrice;//补贴价格
                            activity_type=dataList[i].activityType;//活动类型(普通："0",一元抢:"1",限时抢:"2"，拍下立减:"3")
                            status=dataList[i].status;//状态(在售："0",未开始:"1",卖光："2",结束："3")
                            productList_ul+=" <li data-id=\""+id+"\">";
                            productList_ul+="<img src=\""+load_img+"\" data-url=\""+sales_img_arr+"\">";
                            if(activity_type==2){
                                productList_ul+="<i  class='xianshiqiang'></i>";
                            }
                            if(status==1){
                                productList_ul+="<i  class='weikaishi shangpin_status'></i>";
                            }else if(status==2){
                                productList_ul+="<i style='width:"+shadow_width+"px;height:"+shadow_height+"px;line-height:"+shadow_height+"px' class='yiqiangguang'>已抢光</i>";
                            }else if(status==3){
                                productList_ul+="<i style='width:"+shadow_width+"px;height:"+shadow_height+"px;line-height:"+shadow_height+"px' class='yijieshu'>已结束</i>";
                            }
                            productList_ul+="<div class=\"price_line\">";
                            productList_ul+="<span class=\"goods_name\">"+short_title+"</span>";
                            productList_ul+="</div>";
                            productList_ul+="<div class=\"price_line\">";
                            productList_ul+="<span class=\"pprice\">￥"+toDecimal(active_price-allowance_price)+"</span>";
                            productList_ul+="<del>"+list_price+"</del>";
                            if(sales_count>9999){
                                var sales_count_info="9999+";
                            }else{
                                var sales_count_info=sales_count+"件";
                            }
                            productList_ul+="<span class=\"sell_num\">已售"+sales_count_info+"</span>";
                            productList_ul+="</div>";
                            productList_ul+="</li>";
                          }
                          productList_ul+="</ul>";
                          $("#store_GoodsList").append(productList_ul);
                          $(".store_ul").imglazyload({"imgattr": "data-url"});
                          $(".store_ul li").unbind();
                          $.zheui.bindTouchGoto($(".store_ul li"), to_detail); //绑定li跳转到商品详情页
                      }else{
                          $("#loading").text("暂无商品");
                      }
                 }
                store_list.isload = false;
            },
            timeout:20000,
            error:function(data) {
               console.log(data);
                if (o == 1) {
                    //第一页加载失败处理
                    $("#loading").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading"), function(){
                        $("#loading").html("<span class=\"icon\"></span><span class=\"txt\">努力加载中...</span>");
                        store_list.init(o,sellerid);
                    });
                } else {
                    //后面页加载失败处理
                    $("#loading_more").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading_more"), function() {
                        $("#loading_more").html("<span class=\"icon\"></span><span class=\"txt\">加载中...</span>");
                        store_list.init(o,sellerid);
                    });
                }
            }
        })
    };
   store_list.init(1,seller_id);
   //跳转到商品详情页
    var to_detail=function(obj){
        var data_id=obj.attr("data-id");
        var url = $.zheui.domain + "/m/detail/" + data_id;
        window.location.href = url;
    };
   //加载下一页数据
   var get_nextPage=function(){
       var wh = window.innerHeight;
       var sctop = document.body.scrollTop;
       var pageh = $("#ct").height();
       if ((wh +sctop+50)>= pageh){
           if(store_list.nextpage&&!store_list.isload){
              $("#loading_more").show();
              var curPage = store_list.curPage+1;
               store_list.init(curPage,seller_id);
           }
       }
   };
   $(window).bind("scroll",get_nextPage);
    //定义收缩更多商家优惠信息
    var fav_flag=false;
    var operate_fav={
        fav_show:function(){
            fav_flag=!fav_flag;
            if(fav_flag){
                var add_height=$(".store_favourable").height()-28;
                $(".store_top").height(55+add_height);
                $(".store_GoodsList").css("margin-top",65+add_height+"px");
                $(".show_flag").show();
                $(".fav_more").css("-webkit-transform","rotate(180deg)");
            }else{
                $(".store_top").height(55);
                $(".store_GoodsList").css("margin-top",65+"px");
                $(".show_flag").hide();
                $(".fav_more").css("-webkit-transform","rotate(0)");
            }

        }
    };
    $.zheui.bindTouchGoto($(".fav_more"),operate_fav.fav_show);//显示更多优惠信息
});



