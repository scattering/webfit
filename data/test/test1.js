/**
 * Created by anz on 7/8/2014.
 */
$(document).ready(function() {
    var xDat, yDat, err;
    var linF = function(p, x) {
        return p[0] * x + p[1];
    };
    var gauF = function(p, x) {
        return p[0] * Math.exp(-Math.pow((x - p[1]), 2) / (2 * Math.pow(p[2], 2)));
    };
    var map = [];
    map.push({
        type: "Gaussian",
        params: 3,
        func: gauF,
        p: [1, 2, 3]
    });
    map.push({
        type: "Linear",
        params: 2,
        func: linF,
        p: [1, 2]
    });
    var numParams = 0;
    for (var i = 0; i < map.length; i++) {
        numParams += map[i].params;
    }
    var z = function(x) {
        var c = 0;
        for (var i = 0; i < map.length; i++) {
            c += map[i].func(map[i].p, x);
        }
        return c;
    }
    var makeData = function(pac, x) {
        var c = 0;
        var counter = 0;
        for (var i = 0; i < map.length; i++) {
            if (map[i].type == "Gaussian") {
                c += map[i].func([pac[counter], pac[counter + 1], pac[counter + 2]], x);
                counter += 3;
            }
            if (map[i].type == "Linear") {
                c += map[i].func([pac[counter], pac[counter + 1]], x);
                counter += 2;
            }

        }
        return c;
    }
    var lmSR = function(p, fjac, x, y, err) {
        var count = 0;
        for (var i = 0; i < map.length; i++) {
            map[i].p = [];
            for (var j = 0; j < map[i].params; j++) {
                map[i].p.push(p[count]);
                count++;
            }
        }
        var sqRes = [];
        for (var i = 0; i < xDat.length; i++) {
            sqRes.push(Math.pow(z(xDat[i]) - yDat[i], 2) / err[i]); //fix this               
        }
        var status = 0;

        return {
            status: status,
            f: sqRes
        };
    }
    var simSR = function(pfit) {
        var count = 0;
        for (var i = 0; i < map.length; i++) {
            map[i].p = [];
            for (var j = 0; j < map[i].params; j++) {
                map[i].p.push(pfit[count]);
                count++;
            }
        }
        var sqRes = 0;
        for (i = 0; i < xDat.length; i++) {
            sqRes += Math.pow(z(xDat[i]) - yDat[i], 2) / err[i];
        }
        return sqRes;
    };
	p = [58.5181521018967, 94.15473320987076, 98.89682044740766, 67.28775380179286, 57.117471657693386];
	var xDat=[];
	var yDat=[];
	var err=[];
	for (var i = 0; i < 200; i++) {
            xDat.push(i);
            yDat.push(makeData(p, i));
            err.push(.1);
    }
	var fa = {};
    fa['x'] = xDat;
    fa['y'] = yDat;
    fa['err'] = err;
	pfit=[50,50,50,50,50];
	var m = lmfit.lmfit(lmSR, pfit, fa);
   
    
})