/*
 *
 *上传图片专用js */

define(function(require, exports, module) {


    //单张图片删除
    function clearImg(obj) {
        var _obj = $(obj);
        _obj.remove();
        var thumb_pic = $('.thumb_pic');
        var imgkey = '';
        thumb_pic.each(function() {
            if ($(this).attr("imgkey")) {
                imgkey += "," + $(this).attr("imgkey");
            }
        });
        imgkey = imgkey.substring(1, imgkey.length);
        $("#evidence").val(imgkey);
        if (thumb_pic.length < 3 && !$(".add_pic").length) {
            $("#uploadBox").append('<li class="add_pic"><input type="file" accept="image/jpg,image/jpeg,image/png,image/gif" id="fileImage" name="uploadImg"></li>');
            initInputFile($("#fileImage"));
        }
    }

    //文件选择控件初始化
    var pic_num = 1,
        li_num = 1;

    function initInputFile(obj) {
        obj.bind("change", function() {
            var fileImage = document.querySelector("#fileImage");
            var source = document.querySelector("#source");
            var _data = new FormData();
            _data.append(fileImage.name, fileImage.files[0]);
            _data.append(source.name, source.value);
            var uploadBox = $("#uploadBox");
            var listr = '<li class="thumb_pic" id="thumbpic' + li_num + '" imgkey=""><span class="loading">图片上传中...</span></li>';
            uploadBox.prepend(listr);
            var li_len = uploadBox.find(".thumb_pic").length;
            if (li_len == 3) {
                uploadBox.find(".add_pic").remove();
            }
            li_num++;
            $.ajax({
                type: "POST",
                url: "/trade/seller/products/uploadImage",
                data: _data,
                contentType: false,
                processData: false,
                success: function(data) {
                    //console.log(data);
                    var _data = JSON.parse(data);
                    if (typeof _data == "object") {
                        if (_data.code == 0) {
                            createThumbpic(_data.id, pic_num);
                            pic_num++;
                        } else {
                            $.zheui.toast(_data.msg);
                        }
                    }
                },
                timeout: 20000,
                error: function() {
                    console.log("网络异常");
                }
            });
        });
    }

    var fileImage = $("#fileImage");
    if (fileImage.length) {
        initInputFile(fileImage);
    }

    //创建缩略图
    function createThumbpic(id, pic_num) {
        var _id = id.substring(0, id.lastIndexOf('.')) + ".100x" + id.substring(id.lastIndexOf('.'), id.length);
        var pic_url = "http://z4.tuanimg.com/imagev2/trade/" + _id;
        var uploadBox = $("#uploadBox");
        var curr_li = uploadBox.find("#thumbpic" + pic_num);
        curr_li.attr('imgkey', id);
        curr_li.html('<img src="' + pic_url + '" width="93" height="93" alt=""><span class="btn_clear"></span>');
        $(".btn_clear").unbind();
        $.zheui.bindTouchGoto($(".btn_clear"), function(obj) {
            var _this = obj;
            var _parent = _this.parent();
            setTimeout(function() {
                clearImg(_parent);
            }, 300);
        });
        var thumb_pic = $('.thumb_pic');
        var imgkey = '';
        thumb_pic.each(function() {
            if ($(this).attr("imgkey")) {
                imgkey += "," + $(this).attr("imgkey");
            }
        });
        imgkey = imgkey.substring(1, imgkey.length);
        $("#evidence").val(imgkey);
    }
});