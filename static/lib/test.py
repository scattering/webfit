# -*- coding: utf-8 -*-
"""
Created on Mon Jul 07 15:37:03 2014

@author: anz
"""
import mpfit
import numpy.oldnumeric as Numeric
import numpy as np
def myfunct(p, fjac=None, x=None, y=None, err=None) :
  model=p[1]*x+p[0]
  print y-model
  status=0
  return ([status, np.abs(y-model)])
x = np.arange(3, dtype=float)
p = [5.7, 2.2]
y = ( p[0] + p[1]*x )
pfit = [3.7, 1.2]
fa = {'x':x, 'y':y}
m = mpfit.mpfit(myfunct, pfit, functkw=fa)
print m
#y = ( p[0] + p[1]*[x] + p[2]*[x**2] + p[3]*np.sqrt(x) + p[4]*np.log(x))
#fa = {'x':x, 'y':y, 'err':err}

