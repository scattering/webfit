# Create your views here.
## adds default objects to DB
#from ... import fillDB

import hashlib,os
import types
import tempfile
import json 

import random
from numpy import NaN
from numpy import array
import numpy as np
import hmac

from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render_to_response, render
from django.http import HttpResponse, HttpResponseRedirect, QueryDict
from django.utils import simplejson
#from apps.tracks.forms import languageSelectForm, titleOnlyForm, experimentForm1, experimentForm2, titleOnlyFormExperiment
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger #paging for lists
from django.core.exceptions import ObjectDoesNotExist
import cStringIO, gzip
from django.db import transaction
from django.core.mail import send_mail

## models
from django.contrib.auth.models import User 
from django.contrib.auth import authenticate, login
#import bt7webfit
import webfit_william

#import json
#import simplejson

from django.conf import settings
#FILES_DIR=settings.FILES_DIR

def home(request):
    return render(request,'plot_test.html')

@ensure_csrf_cookie
def webfit(request):
    return render(request,'webfit.html')

#@csrf_exempt
def calculate(request):
    a3start=float(request.POST['a3start'])
    a3step=float(request.POST['a3step'])
    a3end=float(request.POST['a3end'])
    a4start=float(request.POST['a4start'])
    a4step=float(request.POST['a4step'])
    a4end=float(request.POST['a4end']) 
    a3centers=np.arange(a3start,a3end,a3step)
    a4centers=np.arange(a4start,a4end,a4step)
    Ei=14.7
    ki=np.sqrt(Ei/2.072)
    kf=ki
    #a4=webfitcali(al2o3file,calipath = 'webfitcali/',a4c = None, vfile = None,veff = zeros(48),Ef = 0,pl = None, califile = None,webfitrange = range(48),labels = '$Al_2O_3$', BGeff = True)
    al2o3file=os.path.join(os.path.dirname(os.path.realpath(__file__)),r"webfitCalibration_Jan2013.dat")
    #a4_differences=webfit_william.webfitcalia4(al2o3file,a4c = None, Ef = 0, webfitrange=None)
    mydata=np.loadtxt(al2o3file)
    a4_differences=mydata[:,1]
    a4out=[]
    a3out=[]
    for i in range(len(a3centers)):
        for j in range(len(a4centers)):
            a3out.append(a3centers[i]+np.zeros(a4_differences.shape))
            a4=a4centers[j]
            a4out.append(a4+a4_differences)                
            
               
            
    a4out=np.array(a4out).flatten()
    a3out=np.array(a3out).flatten()
    #print len(a4out)
    #print len(a3out)
    q,qx,qy=webfit_william.convertq(ki,kf,a3out,a4out,phioff=0.0)
    #qx=np.array([1,2,3]).tolist()
    #qy=np.array([9,10,11]).tolist()
    series=zip(qx.tolist(),qy.tolist())
    result={'success':'ok', 'qx':qx.tolist(),'qy':qy.tolist(),'series':series}
    return HttpResponse(simplejson.dumps(result))