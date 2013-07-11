Ext.Loader.setConfig({
    enabled: true
});

Ext.Loader.setPath('Ext.ux', '/static/lib/ext/examples/ux');
Ext.Loader.setPath('Ext.selection', '/static/lib/ext/src/selection');
Ext.Loader.setPath('Ext.grid', '/static/lib/ext/src/grid');

Ext.require([
    'Ext.layout.container.*',
    'Ext.tab.*',
    'Ext.grid.*',
    'Ext.form.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
    'Ext.ux.RowExpander',
    'Ext.selection.CellModel',
    'Ext.button.*',
    'Ext.filefield.*',
    "Ext.util.Cookies",
    "Ext.decode",
    "Ext.Ajax",
], function(){
        // Add csrf token to every ajax request
        var token = Ext.util.Cookies.get('csrftoken');
        if(!token){
            Ext.Error.raise("Missing csrftoken cookie");
        } else {
            Ext.Ajax.defaultHeaders = Ext.apply(Ext.Ajax.defaultHeaders || {}, {
                'X-CSRFToken': token
            });
        }
    }
);

Ext.onReady(function () {

    Ext.namespace("webfit");
     
    
    //THE START OF REDISPLAYING
    
    webfit.plotPanel = Ext.create('Ext.form.Panel', {
        title: 'webfit Panel',
        labelWidth: 75, // label settings here cascade unless overridden
        url: 'save-form.php',
        frame: true,
        //bodyStyle: 'padding:5px 5px 0',
        width: 500,
        height: 600,
        //renderTo: Ext.getBody(),
        layout:  { type: 'fit',
            //align: 'center'
        },
        //layoutConfig: {
        //    columns:1
        //},
        defaults: {
            bodyPadding: 4
        },
        afterComponentLayout: function(width, height)
        {
            var data = [['1/2012', 50],['2/2012', 66],['3/2012', 75]];
            $('#'+this.body.id).empty();


            var sinPoints = [];
            for (var i=0; i<2*Math.PI; i+=0.4){
                sinPoints.push([i, 2*Math.sin(i-.8)]);
            }
            webfit.plot = $.jqplot (this.body.id, [sinPoints], {
                title: 'Scan space',
                series: [ {shadow: false,
                           color: 'red',
                           markerOptions: {shadow: false, size: 4},
                           showLine:false
                           }],
                grid: {shadow: false},
                sortData: false,
                axes:{
                    xaxis:{
                        label: 'Qx (inverse Å)',
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {
                            formatString: "%.2g"
                        }
                    },
                    yaxis:{
                        label: 'Qy (inverse Å)',
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {
                            formatString: "%.2g",
                            // fix for ticks drifting to the left in accordionview!
                            _styles: {right: 0}
                        }
                    }
                },
                cursor: {show:true, zoom:false},
                interactors: [{type: 'Line', 
                        name: 'lcursor', 
                        x0: 0.0001,
                        color1: 'green',
                        color2: 'blue'
                        },
                        {type: 'Gaussian',
                        name: 'gcursor',
                        x0: 0.0001,
                        color1: 'green',
                        color2: 'blue'
                        },
                        {type: 'FunctionCollection',
                        name:'fcursor',
                        x0: 0.0001,
                        color1: 'green',
                        color2: 'blue'
                        },
                        {type: 'Gaussian',
                        name: 'g2cursor',
                        x0: 0.0001,
                        color1: 'green',
                        color2: 'blue'
                        },
                ]

            });
            

    webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.lcursor);
    webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.gcursor);
    webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.g2cursor);    
        }
    });
    

    var toolbar = Ext.create('Ext.toolbar.Toolbar', {
        //renderTo: Ext.getBody(),
        id: 1,
        width: 500,
        items: [
            {
                xtype: 'splitbutton',
                text : 'File',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'Import Data', handler: function(){  }},
                        {text: 'New Project', handler: function(){  }},
                        {text: 'Export Graph', handler: function(){  }},
                        {text: 'Save', handler: function(){  }},
                        {text: 'Save As', handler: function(){  }},
                    ]
                })
            },
            '->',
            {
                xtype: 'splitbutton',
                text : 'Edit',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'Undo', handler: function(){  }},
                        {text: 'Redo', handler: function(){  }},
                        {text: 'Rename Project', handler: function(){  }},
                        {text: 'Rename Function', handler: function(){  }},
                    ]
                })
            },
            '->',
            {
                xtype: 'splitbutton',
                text : 'View',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'Projects', handler: function(){  }},
                        {text: 'Data', handler: function(){  }},
                        {text: 'Show',
                        handler: function(){  },
                        menu: new Ext.menu.Menu({
                            items: [{
                                xtype: 'menucheckitem',
                                text: 'Fit Results'
                            },{
                                xtype: 'menucheckitem',
                                text: 'Residuals'
                            },{
                                xtype: 'menucheckitem',
                                text: 'Limits'
                            },
                            ]
                        })}, //show list
                    ]
                })
            },
            '->',
            {
                xtype: 'splitbutton',
                text : 'Help',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'Manual', handler: function(){  }},
                        {xtype    : 'textfield',
                        name     : 'searchField',
                        emptyText: 'Search',
                        handler: function(){  }},
                    ]
                })
            },
            '->',
            {
                xtype: 'splitbutton',
                text : 'Fit Controls',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'New Function', handler: function(){  }},
                        {text: 'Remove Function Options', handler: function(){  }},
                    ]
                })
            },
            '->',
        ]
    });
    
    var functionSelector={};
    
    functionSelector.chooserStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        id: 2,
        data : [
            {"name":"Gaussian"},
            {"name":"Linear"},
        ]
    });
    
    functionSelector.chooser = Ext.create('Ext.form.ComboBox', {
        fieldLabel: 'Choose Function',
        store: functionSelector.chooserStore,
        //renderTo: Ext.getBody(),
        id: 3,
        autoScroll: true,
        queryMode: 'local',
        displayField: 'name',
        editable: false,
        x: 65,
        y: 35,
    });
    
    functionSelector.add = Ext.create('Ext.Button', {
        text: 'Add',
        id: 4,
        //renderTo: Ext.getBody(),
        handler: function() {
        },
        x: 333,
        y: 8,
    });
    
    var selectionPanel = Ext.create('Ext.panel.Panel', {
        width: 496,
        height: 100,
        id: 5,
        //height: 200,
        autoScroll: true,
        //bodyPadding: 50,
        items: [//functionSelector.chooser,
                functionSelector.add],
    });
    
    var addedFunctions = Ext.create('Ext.panel.Panel', {
        title: 'Added Functions',
        width: 496,
        height: 398,
        id: 6,
        autoScroll: true,
        bodyPadding: 50,
    });
    
    var rangeLimit = Ext.create('Ext.tab.Panel', {
        width: 450,
        height: 198,
        id: 8,
        //renderTo: Ext.getBody(),
        items: [{
            title: 'Range'
        }, {
            title: 'Limits',
        }]
    });
    
    var functionSelectionRanges = Ext.create('Ext.panel.Panel', {
        width: 450,
        height: 700,
        id: 7,
        layout: {type: 'vbox',
                align : 'stretch',
                pack  : 'start',
        },
        //renderTo: Ext.getBody(),
        items: [selectionPanel,
                addedFunctions,
                rangeLimit,
                ],
    });
    
    
    

    
    var fitResults = Ext.create('Ext.panel.Panel', {
        title: 'Fit Results',
        width: 100,
        id: 9,
        height: 300,
        autoScroll: true,
        
    });
    
    var innerPlot = Ext.create('Ext.panel.Panel', {
        width: 450,
        height: 500,
        id: 10,
        //renderTo: Ext.getBody(),
        layout: {type: 'hbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [webfit.plotPanel, fitResults],
    });
    
    var residuals = Ext.create('Ext.panel.Panel', {
        title: 'Residuals',
        width: 450,
        id: 11,
        height: 500,
    });
    
    var plotPanel = Ext.create('Ext.panel.Panel', {
        width: 450,
        id: 12,
        height: 500,
        //renderTo: Ext.getBody(),
        layout: {type: 'vbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [innerPlot, residuals],
    });
    
    webfit.workspace = Ext.create('Ext.panel.Panel', {
        width: 1200,
        id: 13,
        height: 700,
        //renderTo: Ext.getBody(),
        layout: {type: 'hbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [functionSelectionRanges,plotPanel],
    });
    
    //console.log('workspace: ', workspace.id);
    //console.log('functionSelectionRanges: ', functionSelectionRanges.id);
    //console.log('plot: ', plot.id);
    //console.log('residuals: ', residuals.id);
    //console.log('innerPlot: ', innerPlot.id);
    //console.log('plotPanel.fitResults: ', plotPanel.fitResults.id);
    //console.log('rangeLimit: ', rangeLimit.id);
    //console.log('addedFunctions: ', addedFunctions.id);
    //console.log('selection: ', selection.id);
    //console.log('functionSelector.add: ', functionSelector.add.id);
    //console.log('functionSelector.chooser: ', functionSelector.chooser.id);
    //console.log('toolbar: ', toolbar.id);     
    
    
    var myTabs = new Ext.TabPanel({
        resizeTabs: true, // turn on tab resizing
        minTabWidth: 115,
        tabWidth: 800,
        enableTabScroll: true,
        tbar:toolbar,
        width: 1200,
        height: 800,
        activeItem: 'webfitTab', //Making the calculator tab selected first
        defaults: {autoScroll:true},
        items: [
            {
                title: 'webfit Planner',
                id: 'webfitTab',
                iconCls: '/static/img/silk/calculator.png',
                layout: 'hbox',
                items: [webfit.workspace]
            },
            {
                title: 'Help Manual',
                id: 'helpmanualtab',
                padding: 5,
                iconCls: '/static/img/silk/help.png',
                html: '<h1>Hi</h1>'

            },
            {
                title: 'Management',
                id: 'managementmanualtab',
                padding: 5,
                iconCls: '/static/img/silk/help.png',
                html: '<h1>Hello there</h1>'

            }
        ]
    });
    
     myTabs.render('tabs');


});