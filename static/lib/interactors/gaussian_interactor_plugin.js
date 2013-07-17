// ## requires interactors.js
// ## and interactor_plugin_base.js

(function($){

    function toArray(obj){
        return Array.prototype.slice.call(obj);
    };
    
    var dist = $.jqplot.dist;
    function bind(scope, fn) {
        return function () {
            return fn.apply(scope, toArray(arguments));
        };
    };
    
    $.jqplot.GaussianInteractorPlugin = function() {};
    $.jqplot.GaussianInteractorPlugin.prototype = new $.jqplot.InteractorPlugin();
    $.jqplot.GaussianInteractorPlugin.prototype.contructor = new $.jqplot.GaussianInteractorPlugin;
    $.jqplot.InteractorPluginSubtypes.Gaussian = $.jqplot.GaussianInteractorPlugin;
    
    $.jqplot.GaussianInteractorPlugin.prototype.init = function(options) {
        $.jqplot.InteractorPlugin.prototype.init.call(this, options);
        this.ymin = -1.9;
        this.ymax = 2;
        this.xc = 2.35;
        this.xhw = 5.2;
        
        $.extend(this, options);
        this.pk = new $.jqplot.PluginPoint(); 
        this.pk.initialize(this, this.xc, this.ymax);
        this.pw = new $.jqplot.PluginPoint(); 
        this.pw.initialize(this, this.xhw, this.ymin);
        this.Gaussian = new $.jqplot.Gaussian(); 
        this.Gaussian.initialize(this, this.pk, this.pw, 3);
        this.grobs.push(this.pk, this.pw, this.Gaussian);
        
        /*if(this.pk.hasOwnProperty('name') && this.Gaussian.name !== "point"){
            console.log("hello");
        }*/
        
        this.pk.move = function(dp){
            var dpos = {x: 0, y: dp.y || 0 };
            //how to prevent negative gaussian??
/*            if(dpos.y - pw.y < 0){
                dpos.y = 0;
            }*/
            this.translateBy(dpos);
        }
            
        this.pw.move = function(dp){
            var dpos = {x: dp.x || 0, y: 0 };
            this.translateBy(dpos);
        }   
        
    };
    
    $.jqplot.VerticalLineInteractor = function() { $.jqplot.InteractorPlugin.call(this); };
    $.jqplot.VerticalLineInteractor.prototype = new $.jqplot.InteractorPlugin();
    $.jqplot.VerticalLineInteractor.prototype.constructor = $.jqplot.VerticalLineInteractor;
    $.jqplot.InteractorPluginSubtypes.VerticalLine = $.jqplot.VerticalLineInteractor;
    
    $.jqplot.VerticalLineInteractor.prototype.init = function(options) {
        $.jqplot.InteractorPlugin.prototype.init.call(this, options);
        //this.points = [];
        this.width = 4;
        this.x0 = 0.0;
        $.extend(this, options);
        this.p = new $.jqplot.PluginPoint();
        this.p.initialize(this, this.x0, 0);
        this.vline = new $.jqplot.VerticalLine();
        this.vline.initialize(this, this.p, this.width);
        this.grobs.push(this.vline);
        this.grobs.push(this.p);
        this.p.render = function(ctx) {
            var height = ctx.canvas.height;
            var width = ctx.canvas.width;
            ctx.fillStyle = this.color;
            //ctx.strokeStyle = 'transparent';
            ctx.beginPath();
            this.putCoords(null, true);
            this.pos.y = height/2.0;
            this.getCoords();
            ctx.fillText(this.coords.x.toPrecision(4) , this.pos.x + 5, this.pos.y - 5);
            ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2, true);
            //ctx.closePath();
            //ctx.stroke();
            ctx.fill(); 
        }
        this.p.move = function(dpos) {
            this.dpos.y = 0;
            this.translateBy(dpos);
            this.parent.redraw();
            //this.parent.translateBy(dpos);
            //this.parent.update();
        }
        
    };
    
})(jQuery);
