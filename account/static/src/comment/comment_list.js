/**
 * 评价系统
 */
define(function (require, exports, module) {

    //引用外界资源
    var $ = require("zepto");
    require("../common/base");
    require("../common/callnative");
    var focus_pic = require("./focus_pic");   //焦点图相关

    var comment_data = {};     //全局变量
    comment_data.nextpage = false;   //默认是否有下一页
    comment_data.productId= $.zheui.getUrlKeyVal("zid");   //评价列表页zid
    comment_data.isYph = $.zheui.getUrlKeyVal("is_Yph");  //1 不是优品汇 2 是优品汇

    //评价列表页数据展示
    comment_data.list = function(o){
        comment_data.isload = false;      //是否正在加载中
        $.ajax({
            type: "GET",
            url: "/api/getprodcommentlist?productId="+comment_data.productId+"&count=10&curPage="+o,
            dataType:"json",
            success: function (data) {
                if(typeof data=="object"&&data.result){
                if (data.result.code == 0) {
                    var total = data.commentStatistics.totalNum;   //评价总数
                    var contentTotal = data.commentInfoPaginate.total;   //有内容的评价总数
                    var page = data.commentInfoPaginate.page;    //第几页
                    var perPage = data.commentInfoPaginate.perPage;   //每页显示数量
                    var Infos_arr = data.commentInfoPaginate.commentInfos;   //评价数组
                    if (contentTotal/(page * perPage)>1) {
                        comment_data.nextpage = true;//是否有下一页
                    }else{
                        comment_data.nextpage = false;//是否有下一页
                    }
                    comment_data.isload = true;      //是否正在加载中
                    comment_data.page = o;   //当前第几页
                    $(".loading_more").hide();
                    var htmlstr = '';

                    var goodCommentRate = data.commentStatistics.goodCommentRate;  //好评率
                    var middleCommentRate = data.commentStatistics.middleCommentRate;  //好中率
                    var negativeCommentRate = data.commentStatistics.negativeCommentRate;  //好差率
                    var goodCommentRate_int = goodCommentRate;
                    if (goodCommentRate.split(".")[1] == 0) {
                        goodCommentRate_int = goodCommentRate.split(".")[0];
                    }

                    if($(".comment_rate").length==0 && parseFloat(goodCommentRate_int) >= 90 && total>=20){
                        var htmlstr = '<div class="comment_rate">';
                        htmlstr += '<p class="grade">共'+total+'人参与评分</p>';
                        htmlstr += '<p class="prate"><span style="color:#666">好评率：</span>'+goodCommentRate_int+'%</p>';
                        htmlstr += '<div class="graph">';
                        htmlstr += '<p>好评<span id="rate_better"><i class="move" style="width:'+goodCommentRate+'%"></i></span></p>';
                        htmlstr += '<p>中评<span id="rate_good"><i class="move"  style="width:'+middleCommentRate+'%"></i></span></p>';
                        htmlstr += '<p>差评<span id="rate_poor"><i class="move"  style="width:'+negativeCommentRate+'%"></i></span></p>';
                        htmlstr += '</div></div>';
                    }
                    htmlstr += '<ul class="list" id="list_' + o + '">';
                    for (var i = 0; i < Infos_arr.length; i++) {
                        var userNickname = Infos_arr[i].userNickname;       //用户昵称
                        var level = Infos_arr[i].level;                                  // 1 差  2 中   3 好
                        var content = Infos_arr[i].content;                          //首评内容
                        var replyContent = Infos_arr[i].commentReplyContent;    //首评商家回复
                        var appendReplyContent = Infos_arr[i].appendReplyContent;    //追评商家回复

                        var createTime = Infos_arr[i].createTime;             //第一次首评时间
                        var firsttime = createTime.split(" ")[0].replace(/\-/g, ".");   //转换成2012.2.4的时间格式
                        var firsthaomiao = (new Date(createTime.split(" ")[0].replace(new RegExp("-", "gm"), "/"))).getTime();   //首评时间毫秒数
                        var appendhaomiao = (new Date(Infos_arr[i].completeTime.split(" ")[0].replace(new RegExp("-", "gm"), "/"))).getTime();  //追评时间毫秒数
                        var deadhaomiao = appendhaomiao - firsthaomiao;
                        var deadtime = parseInt(deadhaomiao / (24 * 60 * 60 * 1000));  //首评和追评之间的时间格式

                        var firstEvidence = Infos_arr[i].firstEvidence;           //首评图片
                        var first_img_arr = firstEvidence.split(",");

                        var append = Infos_arr[i].append;                          //追评内容
                        var appendEvidence = Infos_arr[i].appendEvidence;    //追评图片
                        var append_img_arr = appendEvidence.split(",");

                        if ($.trim(content).length>0|| firstEvidence !=""||$.trim(append).length) {
                        htmlstr += '<li><dl><dt class="ico_head"><img src="//i0.tuanimg.com/ms/zhe800h5/dist/img/temp3.png" width="18" height="18"/></dt>';
                        htmlstr += '<dd><p><span class="nickname">' + userNickname + '</span><span class="time">' + firsttime + '</span>';
                        if (level == 1) {
                            htmlstr += '<span class="score poor"><i></i>差评</span></p>';
                        }
                        if (level == 2) {
                            htmlstr += '<span class="score good"><i></i>中评</span></p>';
                        }
                        if (level == 3) {
                            htmlstr += '<span class="score better"><i></i>好评</span></p>';
                        }
                        if($.trim(content).length>0){
                            htmlstr += '<p class="content">' + content + '</p>';
                        }else{
                            if (level == 1) {
                                htmlstr += '<p class="content">差评</p>';
                            }
                            if (level == 2) {
                                htmlstr += '<p class="content">中评</p>';
                            }
                            if (level == 3) {
                                htmlstr += '<p class="content">好评</p>';
                            }
                        }

                        var skuDesc = Infos_arr[i].skuDesc;         //sku信息
                        if(skuDesc.indexOf("<br/>")>0){
                            var skuDesc_arr = skuDesc.split("<br/>");
                        }else{
                            var skuDesc_arr = skuDesc.split("<br>");
                        }

                        if (skuDesc != null && skuDesc.length > 0) {
                            htmlstr += '<p class="sku">';
                            for(var k = 0; k < skuDesc_arr.length - 1; k++) {
                                if (skuDesc_arr[k].split(":")[0] != "") {
                                    htmlstr += "<span>" + skuDesc_arr[k].split(":")[0] + "：" + skuDesc_arr[k].split(":")[1] + "</span>";
                                }
                            }
                            htmlstr += '</p>';
                        }
                        if (firstEvidence != null && firstEvidence.length > 0) {
                            htmlstr += '<div class="pic_evidence"><ul>';
                            for (var j = 0; j < first_img_arr.length; j++) {
                                htmlstr += '<li><img src="//z11.tuanimg.com/imagev2/trade/' + $.zheui.change_img_size(first_img_arr[j],"100x") + '" /></li>';
                            }
                            htmlstr += '</ul></div>';
                        }
                        if(replyContent){
                            if(level==3){
                                htmlstr+='<div class="answer">[商家回复]'+replyContent+'</div>';
                            }else{
                                htmlstr+='<div class="answer">[商家解释]'+replyContent+'</div>';
                            }
                        }

                        var time = '';

                        if ($.trim(append).length>0) {
                            htmlstr += '<div class="append">';
                            if (deadtime == 0) {
                                htmlstr += '<p><i>[当天追加]</i>' + append + '</p>';
                            } else {
                                htmlstr += '<p><i>[' + deadtime + '天后追加]</i>' + append + '</p>';
                            }
                            if (appendEvidence != null && appendEvidence.length > 0) {
                                htmlstr += '<div class="pic_evidence"><ul>';
                                for (var q = 0; q < append_img_arr.length; q++) {
                                    htmlstr += '<li><img src="//z11.tuanimg.com/imagev2/trade/' + $.zheui.change_img_size(append_img_arr[q],"100x") + '" /></li>';
                                }
                                htmlstr += '</ul></div>';
                            }
                            if(appendReplyContent){
                                if(level==3){
                                    htmlstr+='<div class="answer">[商家回复]'+appendReplyContent+'</div>';
                                }else{
                                    htmlstr+='<div class="answer">[商家解释]'+appendReplyContent+'</div>';
                                }
                            }
                        }
                        htmlstr += '</dd></dl></li>'
                        }
                    }
                    htmlstr += '</ul>';
                    $("#list_main").append(htmlstr);
                    $("#loading").hide();
                    if ($("#list_" + o).find(".pic_evidence").length > 0) {
                        focus_pic.swipe_img($("#list_" + o).find(".pic_evidence"));
                    }
                    if($("#ct").height()<= window.innerHeight && comment_data.nextpage){
                        comment_data.list(o+1);
                    }
                }else{
                    $("#loading").hide();
                    var params = {"text": "加载失败～请稍后再试"};
                    $.common.toast(params);
                }
            }
            },
            timeout:20000,
            error:function(){
                if(o == 1){
                    //第一页加载失败处理
                    $("#loading").text("加载失败，点击重新加载");
                    $.zheui.bindTouchGoto($("#loading"),function(){
                        $("#loading").html("<span class=\"icon\"></span><span class=\"txt\">努力加载中...</span>");
                        comment_data.list(1);
                    });
                }else{
                    //后面页加载失败处理
                    $(".loading_more").html("<span class=\"load_fail\">加载失败，点击重新加载</span>");
                    $.zheui.bindTouchGoto($(".loading_more"),function(){
                        comment_data.list(o);
                        $(".loading_more").html("<span class=\"loading\"><i class=\"icon_load\"></i>加载中......</span>");
                    });
                }
            }
        });
    };

    comment_data.list(1);
    //绑定加载下一页事件
    $(window).bind("scroll",function(){
        var wh = window.innerHeight;
        var sctop=document.body.scrollTop;
        var pageh = $("#ct").height();
        if((wh+sctop)>=pageh){
            if(comment_data.nextpage && comment_data.isload){
                $(".loading_more").html("<span class=\"load\"><i class=\"icon_load\"></i>努力加载中......</span>").show();
                var loadpage = comment_data.page + 1;
                comment_data.list(loadpage);
            }
        }
    });
});



