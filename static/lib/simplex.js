$( document ).ready( function() {

    var flatten = function(myarray){
    var reversed = [];
    var toReturn = [];
    var length = myarray.length;
    if(myarray[0].length !== undefined){
        var colLength = myarray[0].length;
        for(var row = 0; row < length; row++){
            for(var col = 0; col < colLength; col++){
                var popped = myarray.pop();
                reversed.push(popped);
            }
        }
        for(var row = 0; row < length; row++){
            for(var col = 0; col < colLength; col++){
                var popped = reversed.pop();
                toReturn.push(popped);
            }
        }
    }
    else{
        for(var row = 0; row < length; row++){
            var popped = myarray.pop();
            reversed.push(popped);
        }
        for(var row = 0; row < length; row++){
            var popped = reversed.pop();
            toReturn.push(popped);
        }
    }
    return toReturn;
};

    var convertBoolToNum = function(x, y){
        if(x === y){
            return true;
        }
        return false;
    };

    var numArray = function(num, lengthArray/*, type*/){
        console.log('NUM: ',num);
        var toReturn = [];
        if(lengthArray.length > 1){
            /*var row = [];
             for(var i = 0; i < lengthArray[1]; i++){
             row.push(num);
             }*/
            //var toReturn = [];
            for(var length = 1; length < lengthArray[0]; length++){
                toReturn.push([]);
            }
            for(var i = 0; i < lengthArray[1]; i++){
                toReturn[i].push(num);
            }
        }
        else{
            //var toReturn = [];
            for(var i = 0; i < lengthArray[0]; i++){
                toReturn.push(num);
            }
        }

        return toReturn;
    };

    var wrap_function = function(fun, bounds){
        var ncalls = [];
        var function_wrapper = undefined;
        if(bounds !== null){
            var lo = bounds[0];
            var hi = bounds[1];
            function_wrapper = function(x){
                ncalls[0] += 1;
                if(x < lo || x > hi){
                    return Infinity;
                }
                else
                    return fun(x);
            }
        }
        else{
            function_wrapper = function(x){
                ncalls[0] += 1;
                return fun(x);
            }
        }
        return /*ncalls,*/ function_wrapper;
    };

    //assuming axis is a column
    var take = function(array, ind, axis){
        var toReturn = [];
        if(axis === 0){
            for(var i = 0; i < ind.length; i++){
                toReturn.push(array[ind[i]]);
            }
        }
        return toReturn;
    };

    var sum = function(array, axis){
        var toReturn = 0;
        if(axis === 0){
            for(var row = 0; row < array.length; row++){
                for(var col = 0; col < array[0].length; col++){
                    toReturn += array[row][col];
                }
            }
        }
        return toReturn;
    };

    var dont_abort = function(){
        return false;
    };

    var rosen = function(x){
        return x*x;
    }





    var simplex = function(f, x0, bounds, radius, xtol, ftol, maxiter, update_handler, abort_test){
    //check if required variables are defined, if not, initialize them
    if (typeof x0 === 'undefined') {
        var x0 = null;
    }
    if (typeof bounds === 'undefined') {
        var bounds = null;
    }
    if (typeof radius === 'undefined') {
        var radius = .05;
    }
    if (typeof xtol === 'undefined') {
        var xtol = Math.pow(1, -4);;
    }
    if (typeof ftol === 'undefined') {
        var ftol = Math.pow(1, -4);;
    }
    if (typeof maxiter === 'undefined') {
        var maxiter = N * 200;
    }
    if (typeof update_handler === 'undefined') {
        var update_handler = null;
    }

    if (typeof abort_test === 'undefined') {
        var abort_test = dont_abort;
    }




    
    x0 = flatten(x0);

    var N = x0.length;

    
    var rho = 1; 
    var chi = 2; 
    var psi = 0.5; 
    var sigma = 0.5;
    
    var sim = numArray(0, [N+1,N]);
    if(x0.length === 0){
        sim = numArray(0, [N+1]);
    }
    var fsim = numArray(0, [N+1]);
    console.log('SIM: ',sim);
    sim[0] = x0;
    console.log('SIM: ',sim);

    var func = wrap_function(f, bounds);
    fsim[0] = func(x0);
    var val = x0*(1+radius);
    val[convertBoolToNum(val, 0)] = radius;
    /*var x0Shape = [x0.length];
    if(x0[0] !== undefined){
        x0Shape.push(x0[0].length);
    }
    var tol = numArray(1, x0Shape)*xtol;//***
    var bounded = lo === Infinity && hi === Infinity;
    tol[bounded] = (hi[bounded]-lo[bounded])*xtol;
    var xtol = tol;*/

    for(var k = 0; k < N+1; k++){
        var y = x0 + 0;
        y[k] = val[k];
        sim[k+1] = y;
        fsim[k+1] = func(y);
    }


    var ind = fsim.sort();
    fsim = take(fsim, ind, 0);
    sim = take(sim, ind, 0);



    var iterations = 1;
    while(iterations < maxiter){
        var toAnalyze = sim.slice(1,sim.length);
        var allTrue = true;
        for(var i = 0; i < toAnalyze.length; i++){
            if(!(Math.abs(toAnalyze[i] - sim[0]) <= xtol)){
                allTrue = false;
                i = toAnalyze.length;
                //console.log('NOT ALL TRUE');
            }
        }
        if(allTrue && Math.max(Math.abs(fsim[0] - fsim.slice(1,sim.length)) <= ftol)){
            break;
        }
        
        var xbar = sum(sim.slice(0,sim.length-1),0) / N; 
        var xr = (1+rho)*xbar - rho*sim[sim.length-1];
        var fxr = func(xr);
        var doshrink = 0;
        
        if(fxr < fsim[0]){
            var xe = (1+rho*chi)*xbar - rho*chi*sim[sim.length-1];
            var fxe = func(xe);
            
            if(fxe < fxr){
                sim[sim.length-1] = xe;
                fsim[fsim.length-1] = fxe;
            }
            else{
                sim[sim.length-1] = xr;
                fsim[fsim.length-1] = fxr;
            }
        }
        else{
            if(fxr < fsim[sim.length-2]){
                sim[sim.length-1] = xr;
                fsim[fsim.length-1] = fxr;
            }
            else{
                if(fxr < fsim[sim.length-1]){
                    xc = (1+psi*rho)*xbar - psi*rho*sim[sim.length-1];
                    fxc = func(xc);
                    
                    if(fxc <= fxr){
                        sim[sim.length-1] = xc;
                        fsim[fsim.length-1] = fxc;
                    }
                    else{
                    doshrink = 1;
                    }
                }
                else{
                    var xcc = (1-psi)*xbar + psi*sim[sim.length-1];
                    var fxcc = func(xcc);
                    
                    if(fxcc < fsim[fsim.length-1]){
                        sim[sim.length-1] = xcc;
                        fsim[fsim.length-1] = fxcc;
                    }
                    else{
                        doshrink = 1;
                    }
                }
                if(doshrink){
                    for(var j = 1; j < N+1; j++){
                        sim[j] = sim[0] + sigma*(sim[j] - sim[0]);
                        fsim[j] = func(sim[j]);
                    }
                }
            }
        }
        ind = fsim.sort();
        sim = take(sim,ind,0);
        fsim = take(fsim,ind,0);
        if(update_handler != undefined)
            update_handler(iterations, maxiter, sim, fsim);
        iterations += 1;
        if(abort_test()) 
            break;
    }
    var status = 1;
    if(iterations < maxiter){
        status = 0;
    }
    return(sim/*[sim[0], fsim[0]]*/);
};



var x0 = [0.8,1.2,0.7];
var x0 = [0.5];
console.log("Nelder-Mead Simplex");
console.log("===================");
var start = new Date().getTime() / 1000;
var x = simplex(rosen,x0);
console.log(x);
console.log("Time:",new Date().getTime() / 1000 - start);

//x0 = [0,0,0];
//console.log("Nelder-Mead Simplex");
//console.log("===================");
//console.log("starting at zero");
//start = new Date().getTime() / 1000;
//x = simplex(rosen,x0);
//console.log(x);
//console.log("Time:",new Date().getTime() / 1000 - start);
//
//x0 = [0.8,1.2,0.7];
////var lo = [0,0,0];
//var lo = [-1,-1,-1];
//var hi = [1,1,1];
//console.log("Bounded Nelder-Mead Simplex");
//console.log("===========================");
//start = new Date().getTime() / 1000;
//x = simplex(rosen,x0,[lo,hi]);
//console.log(x);
//console.log("Time:",new Date().getTime() / 1000 - start);
//
//x0 = [0.8,1.2,0.7];
//lo = [0.999,0.999,0.999];
//hi = [1.001,1.001,1.001];
//console.log("Bounded Nelder-Mead Simplex");
//console.log("===========================");
//console.log("tight bounds");
//console.log("simplex is smaller than 1e-7 in every dimension, but you can't");
//console.log("see this without uncommenting the print statement simplex function");
//start = new Date().getTime() / 1000;
//x = simplex(rosen,x0,[lo,hi],xtol=1e-4);
//console.log(x);
//console.log("Time:",new Date().getTime() / 1000 - start);
//
//x0 = [0,0,0];
//lo = [0.999,0.999,0.999];
//hi = [1.001,1.001,1.001];
//console.log("Bounded Nelder-Mead Simplex");
//console.log("===========================");
//console.log("tight bounds, x0=0 outside bounds from above");
//start = new Date().getTime() / 1000;
//var rosenN = function(x){
//    return rosen(-x);
//}
//x = simplex(rosenN,x0,[lo,hi],xtol=1e-4);
//console.log(x);
//console.log("Time:",new Date().getTime() / 1000 - start);
//
//x0 = [0.8,1.2,0.7];
//lo = [-Infinity,-Infinity,-Infinity];
//hi = [Infinity,Infinity,Infinity];
//console.log("Bounded Nelder-Mead Simplex");
//console.log("===========================");
//console.log("infinite bounds");
//start = new Date().getTime() / 1000;
//x = simplex(rosen,x0,[lo,hi],xtol=1e-4);
//console.log(x);
//console.log("Time:",new Date().getTime() / 1000 - start);


});