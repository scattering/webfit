# -*- coding: utf-8 -*-
"""
Created on Mon Feb 14 16:21:29 2011
To read webfit and plot with matplotlib.pylab.hexbin
@author: yzhao
"""

import time
from readBT7 import *
from numpy import *
from pylab import *
from scipy.optimize import curve_fit

def webfitcali(al2o3file,calipath = 'webfitcali/',a4c = None, vfile = None,veff = zeros(48),Ef = 0,pl = None, califile = None,webfitrange = range(48),labels = '$Al_2O_3$', BGeff = True):
    if califile == None:
        califile = calipath + 'webfitCali_%s.dat' %time.strftime("%b%d_%Y", time.localtime())
    webfitcol = ['webfitc%02d' %n for n in range(48)]
    al2da = bt7read(al2o3file,col = ['A4']+webfitcol)
    efl = zeros(48)+Ef
    if a4c == None:a4c = mean(al2da[:,0])
    clist = ['b','g','r','c']
    def gau(x,a,b,c,d):
        return a*exp(-(x-b)**2/2/c**2)+d
    def fita4():
        a4d = zeros(48)
        intt = zeros(48)-1.0
        intterr = zeros(48)
        bgl = zeros(48)
        bglerr = zeros(48)
        xx = al2da[:,0]
        if pl:
            figure(figsize=(16,16))
            subplots_adjust(wspace = 0.05,hspace =0.05)
            xfit = linspace(xx[0],xx[-1],200)
            xtic = arange(round(xx[0]),round(xx[-1]),2.0)
            ytic = arange(0,amax(al2da)*1.25,around(amax(al2da)/4.0,decimals = -2))

        for i in webfitrange:
            yy = al2da[:,i+1]
            pi = (ptp(yy),xx[argmax(yy)],0.5,min(yy))
            popt,pcov = curve_fit(gau,xx,yy,p0 = pi,sigma = sqrt(yy))
            if pl:
                subplot(3,4,i/4+1)
                errorbar(xx,yy,sqrt(yy),fmt = '%so' %clist[i%4],label = 'webfit%02d' %i)
                plot(xfit,gau(xfit,*popt),clist[i%4])
#                if i == 36: xlabel('A4',ha = 'right',fontsize = 'xx-large')
#                if i == 16: ylabel('Counts',fontsize = 'xx-large')


                if i%16 == 3:
                    yticks(ytic,[str(n) for n in ytic])
                else:
                    yticks(ytic,[])
                if (i > 34) and (i%4 == 3):
                    xticks(xtic,[str(n) for n in xtic])
                else:
                    xticks(xtic,[])
                legend(frameon = False,ncol = 2)

            a4d[i] = popt[1] - a4c
            intt[i] = popt[0]*popt[2]
            bgl[i] = popt[3]
            intterr[i] = popt[0]*sqrt(pcov[2][2])+popt[2]*sqrt(pcov[0][0])
            bglerr[i] = sqrt(pcov[3][3])
#            print popt[0],pcov[0],pcov[0][0],popt[2],pcov[2][2]
        if pl:
            suptitle(califile,fontsize = 'xx-large')
            axes([0,0,1,1])
            axis('off')
            text(0.5,0.05,'A4',fontsize = 'xx-large')
            text(0.05,0.5,'Counts',fontsize = 'xx-large',rotation='vertical')
            savefig(calipath + 'webfitfit_'+pl)
#        print intt,intterr
        return a4d,intt/mean(sort(intt)[-5:]),bgl/mean(sort(bgl)[-5:]),intterr/mean(sort(intt)[-5:]),bglerr/mean(sort(bgl)[-5:])
    a4dd,intt,bgl,intterr,bglerr = fita4()
    if pl:
        figure()
        errorbar(arange(48)+1,intt,intterr,fmt ='o',label='%s, Fit result' %labels)
        errorbar(arange(48)+1,bgl,bglerr,fmt ='s',label='%s, Background' %labels)
        if vfile:
            vda = bt7read(vfile,col = webfitcol)
            veff = vda/mean(vda[3:-3])
            plot(arange(48)+1,veff,'s',label = 'V count')
        xlabel('webfit wire')
        ylabel('Efficiency')
        xlim(0,50)
        title(califile)
        legend(loc = 'lower center').draw_frame(False)
        savefig(calipath + 'webfiteff_'+pl)
    califd = open(califile,'w')
    califd.write('#BT7 webfit calibration based on %s\n' %al2o3file)
    califd.write('#Created on: %s\n' %time.strftime("%a, %d %b %Y %H:%M:%S", time.localtime()))
    califd.write('#Efficiency  A4  Ef\n')
    if BGeff:
        savetxt(califd,vstack((bgl,a4dd,efl)).T,fmt = '%g')
    else:
        savetxt(califd,vstack((intt,a4dd,efl)).T,fmt = '%g')
    califd.close()
    if pl: show()

def webfitcalidave(al2o3file,a4c = None, vfile = None,veff = zeros(48),pl = None, Ef = 14.7,
            califile = 'webfit_cali.dat',webfitcol = ['webfitc%02d' %n for n in range(48)]):
    # old style which is not used in new webfit Dave package.

    efl = zeros(48)+Ef
    from scipy.optimize import curve_fit
    al2da = bt7read(al2o3file,col = ['A4']+webfitcol)
    def gau(x,a,b,c,d):
        return a*exp(-(x-b)**2/2/c**2)+d
    def fita4():
        a4d = zeros(48)
        intt = zeros(48)
        xx = al2da[:,0]
        for i in range(48):
            yy = al2da[:,i+1]
            pi = (ptp(yy),xx[argmax(yy)],0.5,min(yy))
            popt,pcov = curve_fit(gau,xx,yy,p0 = pi,sigma = sqrt(yy))
            if pl != None:
                if i%16 == 0: figure()
                subplot(4,4,i%16+1)
                errorbar(xx,yy,sqrt(yy),fmt = 'o')
                plot(xx,gau(xx,*popt))
                xlabel('webfit%d' %i)
            a4d[i] = popt[1]
            intt[i] = popt[0]*popt[2]
        return a4d,intt/mean(intt[3:-3])
    a4dd,intt = fita4()
    if a4c != None: a4dd = a4dd - a4c+39.59
    if vfile != None:
        vda = bt7read(vfile,col = webfitcol)
        veff = vda/mean(vda[3:-3])
    if pl != None:
        figure()
        plot(arange(48)+1,intt,'o',label='$Al_2O_3$, Fit result')
        plot(arange(48)+1,veff,'s',label = 'V count')
        xlabel('webfit wire')
        ylabel('Efficiency')
        xlim(0,50)
        legend(loc = 'lower center').draw_frame(False)
        savefig(pl)
    savetxt(califile,vstack((1.0/intt.T,a4dd,efl)).T,fmt = '%g')  # old one
    return

def convertq (ki,kf,a3,a4,phioff=0.0):
#    print shape(ki),shape(kf),shape(a3),shape(a4)
    q = sqrt(ki*ki+kf*kf-2*ki*kf*cos(radians(a4)))
    cospsi = (q*q+ki*ki-kf*kf)/(2*q*ki)
    clip(cospsi, -1.0, 1.0)
    psi = degrees(arccos(cospsi))*sign(a4)
    phi = psi - (90 - a3)+phioff
    qx = q*cos(radians(phi))
    qy = q*sin(radians(phi))
    return q,qx,qy

def bt7read(filen, col = [], coln = array([],int),unpack = False):
    fd = open(filen,'r')
    for line in fd:
        row = line.title().split()
        if row[0] == '#Scan':
            scanCol = int(row[1])-1
        if row[0] == '#Signal':
            sigCol = int(row[1])-1
        if row[0] == '#Reference':
            refCol = int(row[1])-1
        if row[0] == '#Ncolumns':
            num = int(row[1])
        if row[0] == '#Columns':
            colDic=dict([(icol,i) for icol,i in zip(row[1:],range(num))])
            break
    if col or clon:
        for key in col:
            if key in colDic:
                coln = r_[coln,colDic[key]]
    else:
        coln = r_[scanCol,sigCol,refCol]
    return loadtxt(filen,usecols=coln,unpack = unpack)


def readwebfit(files,webfitind = range(48),Ei = 14.7, Efc = 14.7,skip = True,
            califile = 'webfit_cali.dat',savedata = None):
    webfiteff1,a4d, Ef = loadtxt(califile,unpack = True)
    ki = sqrt(Ei/2.072)
    kf = sqrt((Ef+Efc)/2.072)
    qx = empty(0)
    qy = empty(0)
    cc = empty(0)
    mon = empty(0)
    time = empty(0)

    for fn in files:
        data = bt7read(fn,col = ['A3','A4','Monitor','Time']+['webfitc%02d' %n for n in range(48)])
        a3,a4,imon,itime = data[:,0],data[:,1],data[:,2],data[:,3]
        for i in webfitind:
            qq, qxx,qyy = convertq(ki,kf[i],a3,a4-a4d[i])
            ccc = data[:,i+4]/webfiteff1[i]
            qx = r_[qx,qxx]
            qy = r_[qy,qyy]
            cc = r_[cc,ccc]
            mon = r_[mon,imon]
            time = r_[time,itime]
    if savedata != None: savetxt(savedata+'.dat',vstack((xx,yy,cc,mon,time)).T,fmt = '%g')
    if skip:
        ind = where(time != -1.0)
        return qx[ind],qy[ind],cc[ind],mon[ind],time[ind]
    else:
        return qx,qy,cc,mon,time

def plotwebfitmap(files,califile = 'webfit_cali.txt', Ei = 14.7, gridl = None, bins = None,
               webfitind = range(0,48),baseMon = None, xrec = 1, yrec = 1, extent = None,gridsize = 200,
               xt = '(H00) (r.l.u.)', yt = '(0K0) r.l.u.', figt = None, figtext = None, textxp = 0.8, textyp = 0.8,
               skip = True, savef = None, savedata = None,cr = None,ct = None ):
    figw = 9.0
    figh = 8.0
    plr= 0.8
    cbw = 0.4
    xx,yy,cc,mon,time = readwebfit(files,webfitind = webfitind, califile = califile, savedata = savedata, Ei = Ei, skip = skip)
    if not baseMon : baseMon = mean(mon)
    if not extent:
        xr,yr = ptp(xx),ptp(yy)
        ar = maximum(xr,yr)/1.8
        xmid,ymid = (min(xx)+max(xx))/2.0, (min(yy)+max(yy))/2.0
        extent = [(xmid-ar)/xrec,(xmid+ar)/xrec,(ymid-ar)/yrec,(ymid+ar)/yrec]

    figure(figsize = (figw,figh))
    ax = axes([figh/figw*(1-plr)/2+0.02,(1-plr)/2,figh/figw*plr,plr])
    hexbin(xx/xrec,yy/yrec,cc*baseMon/mon,gridsize = gridsize,extent = extent,bins = bins)
    xlabel(xt)
    ylabel(yt)
    if gridl : grid(linestyle = gridl)
    if figt :   title(figt)
    if figtext : text(textxp,textyp,figtext,transform = ax.transAxes)
    cax = axes([figh/figw*(1+plr)*(1+cbw)/4+(1-cbw)/2+0.02,(1-plr)/2,(1-figh/figw)*cbw,plr])
    colorbar(cax = cax).set_label(ct)
    if cr : clim(cr)
    if savef : savefig(savef)
#    show()
    return

def calcq():
    from mpl_toolkits.mplot3d import Axes3D
    fig = plt.figure()
    ax = fig.gca(projection='3d')
#    fd = open('qwebfit.dat','w')
    a4d = loadtxt('webfit_a4space.dat')-39.59
    da = bt7read('./data/Qscanwebfit91189.bt7',['A3','A4','Ei','Ef'])
    xrec = 2*pi*sqrt(2)/3.93
    yrec = 2*pi/13.1176
    qxp,qyp = empty(0),empty(0)
    hwp = empty(0)
    for (a3,a4,ei,ef) in da:
        ki = sqrt(ei/2.072)
        kf = sqrt(ef/2.072)
        q,qx,qy = convertq(ki,kf,a3,a4-a4d.flatten())
        qxp = r_[qxp,qx]
        qyp = r_[qyp,qy]
        hwp = r_[hwp,zeros(48)+ei-ef]

#    print hwp[:48],hwp[:49],hwp[:50]
    ax.plot_surface(qxp.reshape(-1,48)/xrec,qyp.reshape(-1,48)/yrec,hwp.reshape(-1,48),cmap = cm.jet, rstride=1, cstride=4, shade = True)
#         print >> fd,'%.1f' %(ei-ef),' ',
#        vstack((qx[arange(3,49,7)]/xrec,qy[arange(3,49,7)]/yrec)).T.tofile(fd,sep = ' ',format = '%.4f')
#       print >> fd,
    ax.grid(on= False)
    ax.set_xlabel('Qx')
    ax.set_ylabel('Qy')
    ax.set_zlabel('E')

#    fd.close()

    return

def webfitpowder(fn,webfitind = range(48),Ei = 14.7, califile = 'webfit_cali.dat',savedata = None, bins = True, bina4 = 0.25, appeff = True):
    webfiteff1,a4d, Ef = loadtxt(califile,unpack = True)
    ki = sqrt(Ei/2.072)
#    kf = sqrt((Ef+Efc)/2.072)
#    qx = empty(0)
#    qy = empty(0)
#    qq = empty(0)
    cc = empty(0)
    mon = empty(0)
    time = empty(0)
    aa4 = empty(0)

    data = bt7read(fn,col = ['A3','A4','Monitor','Time']+['webfitc%02d' %n for n in range(48)])
    a3,a4,imon,itime = data[:,0],data[:,1],data[:,2],data[:,3]
    for i in webfitind:
        if  appeff:
            ccc = data[:,i+4]/webfiteff1[i]
        else:
            ccc = data[:,i+4]
        iaa4 = a4-a4d[i]
        cc = r_[cc,ccc]
        mon = r_[mon,imon]
        time = r_[time,itime]
        aa4 = r_[aa4,iaa4]

    if bins:
        a4min, a4max = aa4.min(), aa4.max()
        xi = arange(a4min, a4max+bina4, bina4)
        xbinsize = xi[1]-xi[0]

        grid = zeros(xi.shape, dtype=cc.dtype)
        grid_err = zeros(xi.shape, dtype=cc.dtype)

        for row in range(size(grid)):
            xc = xi[row]    # x coordinate.

            # find the position that xc and yc correspond to.
            posx = abs(aa4 - xc)
            ibin = posx <= bina4/2.
            ind  = where(ibin == True)[0]

            # fill the bin.
            cbin = cc[ibin]
            if cbin.size != 0:
                grid[row] = median(cbin)
                grid_err[row] = sqrt(sum(cbin))/cbin.size

            else:
                grid[row] = nan   # fill empty bins with nans.
                grid_err[row] = nan

    # return the grid
        return xi, grid, grid_err
    else:
        return aa4,cc,sqrt(cc)



    if savedata : savetxt(savedata+'.dat',vstack((xi,grid,grid_err)).T,fmt = '%g')
