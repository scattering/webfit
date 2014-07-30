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
		}
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
		if(err[i]!=0)
			sqRes += Math.pow(z(xDat[i]) - yDat[i] / err[i],2);
        }
        return sqRes/(xDat.length-numParams);
    };
    var d;
    var t;
    var retStr;
    var p;
	p = [];
    retStr = "";
    for (var y = 0; y < numParams; y++) {
        p.push(Math.random() * 20);
		retStr+=p[y]+",";
        //    retStr += p[y] + ",";
    }
	document.write(retStr + "<br>");
	document.write("<br>");
		document.write("<br>");	document.write("<br>");	document.write("<br>");	document.write("<br>");	document.write("<br>");	document.write("<br>");	document.write("<br>");
	retStr="";
	xDat = [];
    yDat = [];
    err = [];
    for (var i = 0; i < 100; i++) {
        xDat.push(i*.1);
        yDat.push(makeData(p, i*.1));
        err.push(Math.sqrt(yDat[i]));
    }
    for (var j = 0; j < 20; j++) {
        var pfit = [];
		retStr="";
        for (var y = 0; y < numParams; y++) {
            pfit.push(p[y]+(Math.random()*2 -1));
			retStr += pfit[y] + ",";
        }
        var fa = {};
        fa['x'] = xDat;
        fa['y'] = yDat;
        fa['err'] = err;
        d = new Date();
        t = d.getTime();
        var m = lmfit.lmfit(lmSR, pfit, fa);
        d = new Date();
        retStr += d.getTime() - t;
        retStr += ",";
        d = new Date();
        t = d.getTime();
        var n = SimplexEq.simplex(simSR, pfit);
        d = new Date();
        retStr += d.getTime() - t;
        retStr += ",";
		for(var e=0; e<m.p.length; e++) {
			retStr+=m.p[e];
			retStr+=",";
			retStr+=n.parArr[0][e];
			retStr+=",";
		}
        //retStr += m.iter
		//retStr +="," + n.iter;
        lmChi = m.chisq;
        simChi = simSR(n.parArr[0]);
        //retStr += "," + lmChi + "," + simChi;
        document.write(retStr + "</br>");

        console.log(m);
        console.log(n);
    }
})