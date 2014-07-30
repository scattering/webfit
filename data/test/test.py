# -*- coding: utf-8 -*-
"""
Created on Mon Jul 07 15:37:03 2014

@author: anz
"""
import mpfit
import random
import numpy.oldnumeric as Numeric
import numpy as np
import datetime as dt
#def myfunct(p, fjac=None, x=None, y=None, err=None) :
#	model=p[0]*x+ p[1]+p[2]*x**2
	#print y-model
#	status=0
#	return ([status, np.square((y-model)/err)])
def gauF(p, x) :
	return p[0] * np.exp((-(x - p[1])**2) / (2 * p[2]**2))
def linF(p, x) :
	return p[0] * x + p[1]
xDat=[]
yDat=[]
err=[]
map=[]
map.append({'type': "Gaussian",
            'params': 3,
            'func': gauF,
            'p': [1,2,3]})
map.append({'type': "Gaussian",
            'params': 3,
            'func': gauF,
            'p': [1,2,3]})
map.append({'type': "Linear",
            'params': 2,
            'func': linF,
            'p': [1,2]})

cc=0
for i in range(0, len(map)) :
	cc+=map[i]['params']
def makeData(pac, x) :
	c=0
	counter=0
	for i in range(0, len(map)) :
		if map[i].get('type') == "Gaussian" :
			c+=map[i]['func']([pac[counter], pac[counter+1], pac[counter+2]], x)
			counter+=3
		elif map[i].get('type')  == "Linear" :
			c+=map[i]['func']([pac[counter], pac[counter+1]], x)
			counter+=2
	return c
def z(x) : 
	c=0
	for i in range(0, len(map)) :
		c+=map[i]['func'](map[i].get('p'), x)
	return c

def lmSR(p, fjac, x, y, err) :
	count=0
	for i in range(0, len(map)) :
		map[i]['p']=[]
		for j in range(0, map[i]['params']) :
			map[i]['p'].append(p[count])
			count+=1
	sqRes=[]
	for i in range(0, len(xDat)) :
		sqRes.append(((z(xDat[i])-yDat[i])/err[i]))
	status=0
	return [status, np.asarray(sqRes)]
def simSR(pfit) :
	sqRes=0
	for i in range(0, len(xDat)) :
		sqRes+=((z(xDat[i])-yDat[i])/err[i])**2
	status=0
	return sqRes	
fout=open('pyt2Gaus1Line.csv', mode='w')
fin=open('2gaus1lineDat.csv', mode='r')
for line in fin:
	p=line.split(',')
	for x in range(0, cc) :
		p[x]=float(p[x])
	xDat=[]
	yDat=[]
	err=[]
	for i in range(0, 100) :
		xDat.append(i*.1)
		yDat.append(makeData(p,.1*i))
		if(np.sqrt(yDat[i])==0) :
			err.append(1)
		else :
			err.append(np.sqrt(yDat[i]))
	pfit=[]
	for v in range(0, cc) :
		pfit.append(p[v]+random.uniform(-1,1))
	fa={}
	fa['x']=np.asarray(xDat)
	fa['y']=np.asarray(yDat)
	fa['err']=np.asarray(err)
	a=dt.datetime.now()
	m=mpfit.mpfit(lmSR, pfit, functkw=fa)
	b=dt.datetime.now()
	c=b-a
	d=c.microseconds/1000
	fout.write(str(d)+','+str(m.niter)+','+str(simSR(m.params))+'\n')
fin.closed
fout.closed
	
	


#x = np.arange(100, dtype=float)
#p = [5.7, 2.2,5]
#y = ( p[0]*x + p[1]+p[2]*x**2)
#err=np.ones(100,'Float64')*0.1
#pfit = [3.7, 1.2,3]
#fa = {'x':x, 'y':y, 'err':err}
#m = mpfit.mpfit(myfunct, pfit, functkw=fa)
#print m
#y = ( p[0] + p[1]*[x] + p[2]*[x**2] + p[3]*np.sqrt(x) + p[4]*np.log(x))
#fa = {'x':x, 'y':y, 'err':err}

