function simplex(f, x0, bounds, radius, xtol, ftol, maxiter, update_handler, abort_test){
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
        var maxiter = null;
    }
    if (typeof update_handler === 'undefined') {
        var update_handler = null;
    }
    if (typeof abort_test === 'undefined') {
        var abort_test = dont_abort;
    }



    var flatten = function(array){
        var toReturn = [];
        for(var row = 0; row < array.length; row++){
            for(var col = 0; col < array[0].length; col++){
                toReturn.push(array[row][col];
            }
        }
    }
    x0 = this.flatten(x0);
    var radius = 0.05;
    var val = x0*(1+radius);
    var N = x0.length;
    var numArray = function(num, lengthArray/*, type*/){
        if(lengthArray.length > 1){
            var row = [];
            for(var i = 0; i < lengthArray[1]; i++){
                row.push(/*(type)*/num);
            }
            var toReturn = [];
            for(var length = 1; length < lengthArray[0]; length++){
                toReturn.push(row);
            }
            return toReturn;
        }
    }
    var sim = this.numArray(0, [N+1,N]/*, dtype=x0.dtype*/);
    var fsim = this.numArray(0, [N+1]/*, float*/);
    sim[0] = x0;
    var wrap_function = function(fun, bounds){
        var ncalls = [];
        var function_wrapper = undefined;
        if(bounds !== undefined){
            var lo = bounds[0];
            var hi = bounds[1];
            function_wrapper = function(x){
                ncalls[0] += 1;
                if(x < lo || x > hi){
                    return Infinity;
                else
                    return fun(x);
        }
        else{
            function_wrapper = function(x){
                ncalls[0] += 1;
                return fun(x);
            }
        }
        return /*ncalls,*/ function_wrapper;
    }
    var func = wrap_function(f, bounds);
    fsim[0] = func(x0);
    var maxiter = N * 200;
    var xtol = Math.pow(1, -4);
    var x0Shape = [x0.length, x0[0].length];
    var tol = this.numArray(1, x0Shape)*xtol;//***
    var bounded = lo === Infinity && hi === Infinity;
    tol[bounded] = (hi[bounded]-lo[bounded])*xtol;
    var xtol = tol;
    var ftol = Math.pow(1, -4);

    for(var k = 0; k < N+1; k++){
        var y = x0 + 0;
        y[k] = val[k];
        sim[k+1] = y;
        fsim[k+1] = func(y);
    }

    //assuming axis is a column
    var take = function(array, ind, axis){
        var toReturn = [];
        if(axis === 0){
            for(var i = 0; i < ind.length; i++){
                toReturn.push(array[ind[i]]);
            }
        }
        return toReturn;
    }

    ind = fsim.sort();
    fsim = this.take(fsim, ind, 0);
    sim = this.take(sim, ind, 0);

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
    }

    var rho = 1; 
    var chi = 2; 
    var psi = 0.5; 
    var sigma = 0.5;

    var iterations = 1;
    while(iteractions < maxiter){
        if(numpy.all(Math.abs(sim.slice(1,sim.length)-sim[0])<=xtol) && Math.max(Math.abs(fsim[0] - fsim.slice(1,sim.length)) <= ftol){
            break;
        }
        
        var xbar = this.sum(sim.slice(0,sim.length-1),0) / N; 
        var xr = (1+rho)*xbar - rho*sim[sim.length-1];
        var fxr = func(xr);
        var doshrink = 0;
        
        if(fxr < fsim[0]){
            var xe = (1+rho*chi)*xbar - rho*chi*sim[sim.length-1];
            var fxe = func(xe);
            
            if(fxe < fxr){
                sim[sim.length-1] = xr;
                fsim[sim.length-1] = fxr;
            }
            else{
                if(fxr < fsim[sim.length-1]){
                    xc = (1+psi*rho)*xbar - psi*rho*sim[sim.length-1];
                    fxc = func(xc);
                    
                    if(fxc <= fxr){
                        sim[sim.length-1] = xc;
                        fsim[sim.length-1] = fxc;
                    }
                }
                else{
                    var xcc = (1-psi)*xbar + psi*sim[sim.length-1];
                    var fxcc = func(xcc);
                    
                    if(doshrink){
                        for(var j = 1; j < N+1; j++){
                            sim[j] = sim[0] + sigma*(sim[j] - sim[0]);
                            fsim[j] = func(sim[j]);
                        }
                    }
                }
            }
        }
        var ind = fsim.sort();
        sim = this.take(sim,ind,0);
        fsim = this.take(fsim,ind,0);
        if(update_handler != undefined)
            update_handler(iterations, maxiter, sim, fsim);
        iterations += 1;
        if(abort_test()) 
            break;
    }
}
