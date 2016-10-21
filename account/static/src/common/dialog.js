define(function(require,exports,module){
    /**
     * dialog.js
     * @params
     *  type:1 表示 con参数只能传字符串，非html代码，2表示con可以传入html代码
     *  con: 根据type值传入不同的数据类型
     *  btn1:从左到右 第一个按钮的文字，对应的calss名称是 btn_confirm  通常是确定按钮
     *  btn2:从左到右 第二个按钮的文字，对应的calss名称是 btn_cancel 通常是取消按钮
     */
    function dialog(){
        this.bg = null;
        this.box = null;
    }
    module.exports=dialog;

    dialog.prototype={
        create:function(type,con,btn1,btn2){
        	var $body = $(document.body), $fixed = $('body > .dialog-fixed');

        	/* #107971 解决对话框定位不正确的问题。
				对话框居中方式改为使用 transform: translate(-50%, -50%) 定位，以自动居中。
				添加一个 fixed 的空的容器，以解决某些 Android 机器 position:fixed 后 transform 失效的问题。
				chenkexiu@cd.tuan800.com
				2015/12/30
			*/
        	if (!$fixed.length) {
        		$body.append('<div class="dialog-fixed"></div>');
        		$fixed = $('body > .dialog-fixed');
        	}

            if(!$('.bg_layer').length){
            	$fixed.append('<div class="bg_layer"></div>');
            }
            if(!$('.dialog_box').length){
            	$fixed.append('<div class="dialog_box"></div>');
            }
            this.bg = $(".bg_layer");
            this.fixed = $fixed;
            this.box = $(".dialog_box");
            this.box.empty();
            if(type==1){
                this.box.append('<div class="con_txt">'+con+'</div>');
            }else if(type==2){
                this.box.append(con);
            }
            if(btn1!=undefined){
                this.box.append('<div class="btn_w"><span class="btn_confirm">'+btn1+'</span></div>');
                if(btn2!=undefined){
                    this.box.find(".btn_w").append('<span class="btn_cancel">'+btn2+'</span>');
                }else{
                    this.box.find(".btn_w span").css("width","100%");
                }
            }
            this.show();
        	// #107971 解决对话框定位不正确的问题。对话框将使用 CSS 的方式实现居中，不再需要使用 JavaScript 计算。
            //this.pos();
        },
        pos:function(){
            var wh = $(window).height();
            var max = Math.max(wh,document.body.clientHeight);
            var dialog_h  = this.box.height();
            var _top = (wh-dialog_h)/2;
            this.bg.css("height",max+"px");
            //alert(wh+":"+max+":"+dialog_h+":"+_top);
            if(_top > wh || _top > max){
                var _topB = _top/2;
                this.box.css("top",_topB+"px"); 
            }else{
                this.box.css("top",_top+"px");
            }
            
        },
        show:function(){
            var that = this;
            that.bg.show();
            that.box.show();
            that.fixed.show();
            setTimeout(function(){
                that.bg.css("opacity","1");
                that.box.css("opacity","1");
            },1);
        },
        hide:function(){
            var that = this;
            that.bg.css("opacity","0");
            that.box.css("opacity","0");
            that.box.hide();
            setTimeout(function(){
            	that.bg.hide();
            	that.fixed.hide();
            },300);
        }
    }

});
