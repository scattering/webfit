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
    
    $.jqplot.LineInteractorPlugin = function() {};
    $.jqplot.LineInteractorPlugin.prototype = new $.jqplot.InteractorPlugin();
    $.jqplot.LineInteractorPlugin.prototype.contructor = new $.jqplot.LineInteractorPlugin;
    $.jqplot.InteractorPluginSubtypes.Line = $.jqplot.LineInteractorPlugin;
    
    $.extend($.jqplot.LineInteractorPlugin.prototype, {
        init: function(options) {
            $.jqplot.InteractorPlugin.prototype.init.call(this, options);
            this.xmin = 0.0;  // keeps track of slope, intercept, and the coordinates of the two defining points of the line
            this.ymin = 0.0;
            this.xmax = 1.0;
            this.ymax = 1.0;
            this.slope = 1.0;
            $.extend(this, options);
            this.slope = (this.ymax - this.ymin) / (this.xmax - this.xmin); // calculates initial slope of line 
            this.intercept = (this.ymax - this.ymin) - (this.slope * (this.xmax - this.xmin)); // calculates initial y-intercept of line
            
            /*this.p1 = new $.jqplot.PluginPoint(); 
            this.p1.initialize(this, this.xmin, this.ymin); */// creates two plugin points for the line      
            this.p2 = new $.jqplot.PluginPoint(); 
            this.p2.initialize(this, this.xmax, this.ymax);
            
            this.line = new $.jqplot.Linear(); 
            this.line.initialize(this, /*{x: 0, y: 0 }*/, this.p2, 5); // creates a line using both plugin points
            
            this.grobs.push(this.linear, /*this.p1*/, this.p2); // adds line interactor (PluginPoints, line) to list of interactors on graph
            
 /*           this.p1.move = function(dp){
                var dpos = {x: 0, y: 0 };
                this.translateBy(dpos);
                alert("hey!");
            }*/
            this.p2.move = function(dp){
                var dpos = {x: dp.x || 0, y: dp.y || 0 };
                this.translateBy(dpos);
            }
        },
        
 /*       getSlope: function() {
            this.slope = (this.p2.coords.y - this.pivot.coords.y) / (this.p2.coords.x - this.pivot.coords.x);
            return this.slope;
        },
        getIntercept: function() {
            var slope = this.getSlope();
            this.intercept = (this.p2.coords.y - this.pivot.coords.y) - (slope *  (this.p2.coords.x - this.pivot.coords.x));
            return this.intercept;
        }*/
        
/*
        this.grobs.push(this.linear, this.p1, this.p2);
        
        //this.redraw();
    }
*/
    });
    
    $.jqplot.LineInteractorPlugin.prototype.init

    
})(jQuery);

    