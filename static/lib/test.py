# -*- coding: utf-8 -*-
"""
Created on Mon Jul 07 15:37:03 2014

@author: anz
"""
import mpfit
import numpy.oldnumeric as Numeric
import numpy as np
import pylab
import pandas as pd

def model(x,p):
  return 100+p[0]*np.exp(-(x-p[1])**2/(2*p[2]**2))/np.sqrt(2*np.pi)/p[2]
def myfunct(p, fjac=None, x=None, y=None, err=None) :
  
  #print y-model
  status=0
  return ([status, ((y-model(x,p))/err)])
x = np.arange(-25,25,.2, dtype=float)
p = [10000.00001,3,4]
#y = p[0]*np.exp(-(x-p[1])**2/(2*p[2]**2))/np.sqrt(2*np.pi)/p[2]
y=model(x,p)
noise=np.random.normal(y,np.sqrt(y))
y=noise
#y=y+noise
err=np.sqrt(y)

pfit = [5,4,3]
fa = {'x':x, 'y':y, 'err':err}
m = mpfit.mpfit(myfunct, pfit, functkw=fa)
a=myfunct(m.params, x=x,y=y, err=err)
print m
print m.fnorm/m.dof
print np.nansum(a[1]**2)/m.dof
df=pd.DataFrame({'x':x,'y':y,'err':err},columns=['x','y','err'])
df.to_csv('gauss.csv',index=False,index_label=False,header=False)

if 0:
  pylab.errorbar(x,y,yerr=err,linestyle="None",marker='s')
  pylab.plot(x,model(x,m.params))
  pylab.show()


#y = ( p[0] + p[1]*[x] + p[2]*[x**2] + p[3]*np.sqrt(x) + p[4]*np.log(x))
#fa = {'x':x, 'y':y, 'err':err}

