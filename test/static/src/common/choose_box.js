/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-03-13 16:09:29
 * @version $Id$
 */

define(function(require,exports,module){

      exports.create=function(title,hd_btn_con,by_con){
	     var choose_box_html = "";
            choose_box_html += '<div  class="choose_box">';
            choose_box_html += '<div class="choose_hd">';
            choose_box_html += '<span class="choose_tit">'+title+'</span>';
            choose_box_html += '</div>';
            choose_box_html += '<div class="choose_by">';
            choose_box_html += ''+by_con+'';
            choose_box_html += '</div></div>';
            
            $("#ct").append(choose_box_html);
            $(".choose_hd").append(hd_btn_con);
          
      }

      exports.openBox=function(){
            // console.log($(".choose_box").height());
            $(".choose_box").show();
            setTimeout(function(){$(".choose_box").css("z-index","990");$(".choose_box").addClass("open_box");},50);
            setTimeout(function(){
              document.body.scrollTop=0;
              //控制页面高度
            var max_h  = Math.max(window.innerHeight,document.body.clientHeight,$(".choose_box").height());
            $("#ct").css("height",max_h+"px");
            $(".choose_box").css("height",max_h+"px");
            },200);
            
      }
      exports.closeBox=function(){
            // console.log($(".choose_box").height());
            $("#ct").css("height","");
            setTimeout(function(){$(".choose_box").css("z-index","-1");$(".choose_box").hide();$(".choose_box").remove();},300);
            $(".choose_box").removeClass("open_box");
      }
      /**
       * [refresh description]
       * @by_con [传入需要更新的数据]
       */
      exports.refresh=function(by_con){
            $(".choose_by").html("");
            $(".choose_by").html(by_con);
      }

});