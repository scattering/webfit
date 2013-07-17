
// Requires interactors.js
// Requires interactors_plugin_base.js

(function($){
    function toArray(obj){
        return Array.prototype.slice.call(obj);
    };
    
    var dist = $.jqplot.dist;
    function bind(scope, fn){
        return function(){
            return fn.apply(scope, toArray(arguments));
        };
    };
    
    $.jqplot.LinearGaussianInteractorPlugin = function() {};
    $.jqplot.LinearGaussianInteractorPlugin.prototype = new $.jqplot.InteractorPlugin();
    $.jqplot.LinearGaussianInteractorPlugin.prototype.constructor = $.jqplot.LinearGaussianInteractorPlugin;
    $.jqplot.InteractorPluginSubtypes.LineGaussian = $.jqplot.LinearGaussianInteractorPlugin;
    $.extend($.jqplot.LinearGaussianInteractorPlugin.prototype, {
        init: function(options) {
            $.jqplot.InteractorPlugin.prototype.init.call(this, options);
            this.xmin = 0.0;  
            this.ymin = 0.0;
            this.xmax = 5.0;
            this.ymax = 1.0;
            //this.slope = 1.0;
            this.yming = 1.5;
            this.ymaxg = 2;
            this.xc = 2.35;
            this.xhw = 3.2;
            this.f = this.LinearGaussian;
            
            $.extend(this, options);
            // creates two plugin points for the line
            this.pivot = new $.jqplot.PluginPoint(); this.pivot.initialize(this, this.xmin, this.ymin);
            this.p2 = new $.jqplot.PluginPoint(); this.p2.initialize(this, this.xmax, this.ymax);
            this.linear = new $.jqplot.Linear(); this.linear.initialize(this, this.pivot, this.p2, 4);
            
            //creates two plugin points for the gaussian
            this.pk = new $.jqplot.PluginPoint(); this.pk.initialize(this, this.xc, this.ymaxg);
            this.pw = new $.jqplot.PluginPoint(); this.pw.initialize(this, this.xhw, this.yming);
            this.Gaussian = new $.jqplot.Gaussian(); this.Gaussian.initialize(this, this.pk, this.pw, 3);
            
            //this.linearGaussian = this.linear + this.Gaussian;
            this.grobs.push( this.pivot, this.p2, this.pw, this.pk);
             
            this.pivot.move = function(dp){
                //locks point into place
            }
            
            this.pk.move = function(dp){
                var dpos = {x: 0, y: dp.y || 0 };
                //how to prevent negative gaussian??
                this.translateBy(dpos);
            }
                
            this.pw.move = function(dp){
                var dpos = {x: dp.x || 0, y: 0 };
                this.translateBy(dpos);
            } 
        },
        
        render: function(ctx){
            $.jqplot.FunctionConnector.prototype.render.call(this, ctx);
            this.drawEq(ctx, bind(this, this.f), 0, this.pivot.pos.y, 0, this.parent.canvas.width);
        },
        
        LinearGaussian: function(x){
             return this.linear.f + this.Gaussian.f;       
        }
    });
    
 /*   $.jqplot.LinearInteractorPlugin = function() {}; // defines LinearInteractorPlugin
    $.jqplot.LinearInteractorPlugin.prototype = new $.jqplot.InteractorPlugin(); // LinearInteractorPlugin inherits from InteractorPlugin
    $.jqplot.LinearInteractorPlugin.prototype.constructor = $.jqplot.LinearInteractorPlugin;
    $.jqplot.InteractorPluginSubtypes.Line = $.jqplot.LinearInteractorPlugin; // adds LinearInteractorPlugin to InteractorPluginSubtypes list as 'Line'
    $.extend($.jqplot.LinearInteractorPlugin.prototype, {
        init: function(options) {
    //$.jqplot.LinearInteractorPlugin.prototype.init = function(options) {
            $.jqplot.InteractorPlugin.prototype.init.call(this, options);
            this.xmin = 0.0;  // keeps track of slope, intercept, and the coordinates of the two defining points of the line
            this.ymin = 0.0;
            this.xmax = 1.0;
            this.ymax = 1.0;
            
            $.extend(this, options);
            this.slope = (this.ymax - this.ymin) / (this.xmax - this.xmin); // calculates initial slope of line 
            this.intercept = (this.ymax - this.ymin) - (this.slope * (this.xmax - this.xmin)); // calculates initial y-intercept of line
            
            this.p1 = new $.jqplot.PluginPoint(); this.p1.initialize(this, this.xmin, this.ymin); // creates two plugin points for the line
            this.p2 = new $.jqplot.PluginPoint(); this.p2.initialize(this, this.xmax, this.ymax);
            this.linear = new $.jqplot.Linear(); this.linear.initialize(this, this.p1, this.p2, 4); // creates a line using both plugin points
           
            this.grobs.push(this.linear, this.p1, this.p2); // adds line interactor (PluginPoints, line) to list of interactors on graph
//maybe later try to make the entire line move instead of just locking the point there?            
            this.p1.move = function(dp){
                //locks point into place
            }
        
        },
        
    });
    
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
        this.pk = new $.jqplot.PluginPoint(); this.pk.initialize(this, this.xc, this.ymax);
        this.pw = new $.jqplot.PluginPoint(); this.pw.initialize(this, this.xhw, this.ymin);
        this.Gaussian = new $.jqplot.Gaussian(); this.Gaussian.initialize(this, this.pk, this.pw, 3);
        this.grobs.push(this.pk, this.pw, this.Gaussian);
        
        this.pk.move = function(dp){
            var dpos = {x: 0, y: dp.y || 0 };
            //how to prevent negative gaussian??
            this.translateBy(dpos);
        }
            
        this.pw.move = function(dp){
            var dpos = {x: dp.x || 0, y: 0 };
            this.translateBy(dpos);
        }   
        
    };*/
    
})(jQuery);
