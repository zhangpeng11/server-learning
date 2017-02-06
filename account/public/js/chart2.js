/**
 * Created by Administrator on 2016/10/31.
 */

var chart = {

    circle:{
        radius: 50,
        cenrerX: 200,
        centerY:80,
        endR:0,
        startR:0,
    },

    drawCircle: function(){
        var canvas = $("#mycanvas");
        if(canvas){
            var context = canvas[0].getContext("2d");
            //context.moveTo(this.circle.cenrerX,this.circle.centerY);
            //context.lineTo(this.circle.cenrerX, this.circle.centerY, this.circle.radius * Math.sin(this.circle.startR) + this.circle.cenrerX, this.circle.radius * Math.cos(this.circle.startR) - this.circle.centerY);
            context.arc(this.circle.cenrerX, this.circle.centerY, this.circle.radius, this.circle.startR, this.circle.endR, false);
            context.lineTo(this.circle.radius * Math.sin(this.circle.endR) + this.circle.cenrerX, this.circle.radius * Math.cos(this.circle.endR) - this.circle.centerY, this.circle.cenrerX, this.circle.centerY);
            context.stroke();
            context.closePath();
        }
    },

    drawSuqire: function(type){
        var canvas = $("#mycanvas");
        if(canvas){
            var cxt = canvas[0].getContext("2d");
            switch (type) {
                case "1":
                    cxt.fillStyle = "red";
                    cxt.fillRect(10, 10, 5, 5);
                    break;
                case "2":
                    cxt.fillStyle = "green";
                    cxt.fillRect(10, 20, 5, 5);
                    break;
                case "3":
                    cxt.fillStyle = "blue";
                    cxt.fillRect(10, 30, 5, 5);
                    break;
                case "4":
                    cxt.fillStyle = "yellow";
                    cxt.fillRect(10, 40, 5, 5);
                    break;
                case "5":
                    cxt.fillStyle = "orange";
                    cxt.fillRect(10, 50, 5, 5);
                    break;
                case "7":
                    cxt.fillStyle = "gray";
                    cxt.fillRect(10, 60, 5, 5);
                    break;
                default :
                    console.log("else");
            }
            cxt.lineTo(this.circle.cenrerX, this.circle.centerY, this.circle.radius * Math.sin(this.circle.startR) + 100, this.circle.radius * Math.cos(this.circle.startR) - 100);
            cxt.arc(this.circle.cenrerX, this.circle.centerY, this.circle.radius, this.circle.startR, this.circle.endR, false);
            cxt.lineTo(this.circle.cenrerX, this.circle.centerY, this.circle.radius * Math.sin(this.circle.endR) + 100, this.circle.radius * Math.cos(this.circle.endR) - 100);
            cxt.stroke();
            cxt.closePath();
            cxt.fill();
        }
    },

    getChartInfo: function(){
        var that = this;
        $.ajax({
            type: "get",
            url: "./getInfo",
            data:{id:1},
            success: function(data){
                if(data && data.length){
                    var paySum = 0,
                        incomeSum = 0;
                    var typeSum = {};
                    data.forEach(function(item, index){
                        var type = item.type;
                        if(!typeSum[type]){
                            typeSum[type] = item.money;
                        }
                        else{
                            typeSum[type] += item.money;
                        }
                        if(item.type != 6){
                            paySum += item.money;
                        }
                    });
                    for(var i in typeSum){
                        if(i != 6){
                            var percent = typeSum[i]/paySum;
                            that.circle.startR = that.circle.endR;
                            that.circle.endR += 2 * percent * Math.PI;
                            that.drawCircle();
                            //that.drawSuqire(i);
                            console.log("  "+that.circle.startR+"  "+ that.circle.endR+"   "+typeSum[i]+"   "+paySum+"   "+percent);
                        }
                    }
                }
            },
            timeout:2000,
            errot: function(err){
                console.log("ajax error");
            }
        });
    },

    init: function(){
        this.getChartInfo();
    }
};

chart.init();