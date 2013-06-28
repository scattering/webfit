# -*- coding: utf-8 -*-
"""
Created on Tue Feb 19 14:52:00 2013
for William  webfit calculator

@author: yzhao
"""

from numpy import *
from scipy.optimize import curve_fit

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

def webfitcalia4(al2o3file,a4c = None, Ef = 0, webfitrange=None):
    if webfitrange is None:
        webfitrange=range(48)
    webfitcol = ['webfitc%02d' %n for n in range(48)]
    al2da = bt7read(al2o3file,col = ['A4']+webfitcol)
    efl = zeros(48)+Ef
    if a4c == None:a4c = mean(al2da[:,0])
    def gau(x,a,b,c,d):
        return a*exp(-(x-b)**2/2/c**2)+d
    a4d = zeros(48)
    intt = zeros(48)-1.0
    intterr = zeros(48)
    bgl = zeros(48)
    bglerr = zeros(48)
    xx = al2da[:,0]

    for i in webfitrange:
        yy = al2da[:,i+1]
        pi = (ptp(yy),xx[argmax(yy)],0.5,min(yy))
        popt,pcov = curve_fit(gau,xx,yy,p0 = pi,sigma = sqrt(yy))

        a4d[i] = popt[1] - a4c
    return a4d


#a4d = webfitcalia4('..\\webfitcali\\fpx99903.bt7')
#print a4d