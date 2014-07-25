/**
 * Created by anz on 7/8/2014.
 */
$(document).ready(function () {
    var myFunction=function(p, fjac, x, y, err)
    {
        var retArr=[];
        var model=mod;
        for(i=0; i< x.length;i++)
        {
            retArr.push(Math.abs(y[i]-model(p,x[i])));
        }
        var status=0;
        return {status:status, f:retArr};
    }
    var mod= function(p, x)
    {
        return p[1]*x*x+p[0]*x;
    }
    var  toMod=function(p, x)
    {
        return p[1]*x+p[0];
    }
    var x=[],y=[];
    for(var i=0; i<3; i++)
    {
        x.push(i);
        y.push(toMod([5.7,2.2],x[i]));
    }
    var pfit=[3.7, 1.2];
    var fa={};
    fa['x']=x;
    fa['y']=y;
    var m=lmfit.lmfit(myFunction, pfit, fa);
    console.log(m);
})
