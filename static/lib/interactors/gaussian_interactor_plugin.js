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

       // this.ymin = -1.9;
       // this.ymax = 2;
       // this.xc = 2.35;
        //this.xhw = 5.2;

        this.xc=(options.xmax+options.xmin)/2;
        this.ymax=options.ymax/2;
        this.xhw=this.xc+(options.xmax-options.xmin)/4;  //let's be a little more narrow than the full range

        $.extend(this, options);
        this.pk = new $.jqplot.PluginPoint();   //  The center
        this.pk.initialize(this, this.xc, this.ymax);
        this.pw = new $.jqplot.PluginPoint();   // The HWHM
        this.pw.initialize(this, this.xhw, this.ymax/2);
        // this.pw.initialize(this, this.xhw, this.ymin);
        this.Gaussian = new $.jqplot.Gaussian(); 
        this.Gaussian.initialize(this, this.pk, this.pw, 3);  // Linewidth=3
        this.grobs.push(this.pk, this.pw, this.Gaussian);


        
        this.pk.move = function(dp){
            var dpos = {x: 0, y: dp.y || 0 };
            this.translateBy(dpos);
        }
            
        this.pw.move = function(dp){
            var dpos = {x: dp.x || 0, y: 0 };
            this.translateBy(dpos);
        }   
        
    };
    
})(jQuery);
