from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from django.conf import settings
REPO_ROOT=settings.REPO_ROOT

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'webfit.views.home', name='home'),
    # url(r'^webfit/', include('webfit.foo.urls')),
    #url(r'^$', 'webfit.apps.viewwebfit.views.home'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    #(r'', include('registration.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)



urlpatterns += patterns(REPO_ROOT + '.apps.webfit.views',
                        ('^webfit$', 'webfit'),
                        ('^calculate/$', 'calculate'), 
                        ('^$', 'home'),                                                      
                        )

