/*STATUS: register now works, unregister has a problem with indexOf()
*/
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
    $.jqplot.FunctionCollectionInteractorPlugin = function() {};  //is an interactor
    $.jqplot.FunctionCollectionInteractorPlugin.prototype = new $.jqplot.InteractorPlugin();
    $.jqplot.FunctionCollectionInteractorPlugin.prototype.contructor = new $.jqplot.FunctionCollectionInteractorPlugin;
    $.jqplot.InteractorPluginSubtypes.FunctionCollection = $.jqplot.FunctionCollectionInteractorPlugin;
    //$.extend($.jqplot.FunctionConnector.prototype, {
    $.extend($.jqplot.FunctionCollectionInteractorPlugin.prototype, {
    interactors:[]
    })
    $.extend($.jqplot.FunctionCollectionInteractorPlugin.prototype, {
        init: function(options) {
            $.jqplot.InteractorPlugin.prototype.init.call(this, options);
            this.interactors = [];
            //this.sum = 0;
            this.FunctionCollection = new $.jqplot.FunctionCollection;
            this.FunctionCollection.initialize(this, 3);
            this.FunctionCollection.f=this.sum;
            $.extend(this,options);
            this.grobs.push(this.FunctionCollection)
        },
        
        register: function(toAdd){
            for(i = 0; i < toAdd.grobs.length; i++){
                toAdd.grobs[i].listeners.push(this);            
            }
            this.interactors.push(toAdd);   
        },
        
        //returns the removed interactor w/o this as a listener
        unregister: function(toRemove){
            var index = this.interactors.indexOf(toRemove);
            if(index === interactors.length-1){
                interactors.pop();
            }
            else if(index > -1){
                for(var i = index; i < this.interactors.length; i++){
                    this.interactors[i] = this.interactors[i+1];
                }
            }
            return this.removeListeners(toRemove);
        },
        
        //assuming that method only called on interactors in the array
        removeListeners: function(interactor){
            for(var i = 0; i < interactor.grobs.length; i++){
                var index = interactor.grobs[i].listeners.indexOf(this);
                var listeners = interactor.grobs[i].listeners;
                if(index === listeners.length-1){
                    listeners.pop();                
                }
                else{
                    for(var j = index; j < listeners.length; j++){
                        listeners[j] = listeners[j+1];
                    }                    
                }         
            }
            return interactor;
        },
        
        update: function(pos){
            //this.sum = 0;
            //for(var i = 0; i < this.interactors.length; i++){
            //    for(var j = 0; j < this.interactors[i].grobs.length; j++){
            //        if(this.interactors[i].grobs[j].hasOwnProperty('name') && this.interactors[i].grobs[j].name !== "point"){
                        //this.interactors[i].grobs[j].translateBy(pos);
            //            this.sum += this.interactors[i].grobs[j].f(x);
            //        }
            //    }
            //} 
            //console.log(this.sum)
            //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.redraw();
        },
        
        //render: function(ctx){
        //    $.jqplot.FunctionConnector.prototype.render.call(this, ctx);
        //    this.drawEq(ctx, bind(this, this.f), 0, this.Canvas.getHeight, 0, this.Canvas.getWidth);
        //},
        
        sum: function(x){
            var res = 0;
            var interactors=this.parent.interactors
            for(var i = 0; i < interactors.length; i++){
                //what if its a plugin point?
                for(var j = 0; j < interactors[i].grobs.length; j++){
                    if(interactors[i].grobs[j].hasOwnProperty('name') && interactors[i].grobs[j].name !== "point"){
                        res += interactors[i].grobs[j].f(x);
                        //console.log(interactors[i].grobs[j])
                        //console.log(x,interactors[i].grobs[j].f(x),res)
                    }
                }
            }
            return res;
        },
        
        //updateListeners: function() {
        //    for (var i in this.listeners) {
        //        var pos = this.getCoords? this.getCoords() : this.pos;
        //        this.listeners[i].update(pos);
        //    }
        //},
    });
    
})(jQuery);
