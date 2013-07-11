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
    'Ext.ux.CheckColumn',
    //'Ext.ux.ActionColumn',
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
    Ext.namespace("functionSelector");
    Ext.namespace("rangeLimiter");
    Ext.namespace("plotPanel");
    Ext.namespace("residualPanel");   
    
    //THE START OF REDISPLAYING
    var toolbar = Ext.create('Ext.toolbar.Toolbar', {
        renderTo: Ext.getBody(),
        id: 1,
        width: 1200,
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
            { xtype: 'tbspacer', width: 45},
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
            { xtype: 'tbspacer', width: 45},
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
            { xtype: 'tbspacer', width: 45},
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
            { xtype: 'tbspacer', width: 45},
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
            { xtype: 'tbspacer', width: 45},
        ]
    });
    
    /*functionSelector.chooserStore = Ext.create('Ext.data.Store', {
        fields: ['name'],
        id: 2,
        data : [
            {"name":"Gaussian"},
            {"name":"Linear"},
        ]
    });*/
    
    functionSelector.chooser = Ext.create('Ext.form.ComboBox', {
        fieldLabel: 'Choose Function',
        store: new Ext.data.Store({
            fields: ['name'],
            id: 2,
            data : [
                {"name":"Gaussian"},
                {"name":"Linear"},
            ]
        }),
        renderTo: Ext.getBody(),
        id: 3,
        autoScroll: true,
        queryMode: 'local',
        displayField: 'name',
        editable: false,
        x: 22,
        y: 35,
    });
    
    functionSelector.add = Ext.create('Ext.Button', {
        text: 'Add',
        id: 4,
        renderTo: Ext.getBody(),
        handler: function() {
        },
        x: 292,
        y: 8,
    });
    
    functionSelector.selection = Ext.create('Ext.panel.Panel', {
        width: 496,
        height: 100,
        id: 5,
        //height: 200,
        autoScroll: true,
        //bodyPadding: 50,
        items: [functionSelector.chooser, functionSelector.add],
    });
    
    functionSelector.addStore = Ext.create('Ext.data.Store', {
        fields: [
            {name: 'name', type: 'string'},
            {name: 'type', type: 'string'},
            {name: 'color', type: 'blue'},
            {name: 'show', type: 'boolean'},
        ],
        id: 2,
        data : [
            {'name':'Gaussian0','type': 'Gaussian','color': 'Blue', 'show': true},
        ]
    });    
    
    functionSelector.addedFunctions = Ext.create('Ext.grid.Panel', {
        xtype: 'cell-editing',
        title: 'Added Functions',
        id: 6,
        plugins: [new Ext.grid.plugin.CellEditing({
            clicksToEdit: 2
        })],
        autoScroll: true,
        store: functionSelector.addStore,
        columns: [{
                header: 'Function Name',
                dataIndex: 'name',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'Function Type',
                dataIndex: 'type',
                width: 90,
                editable: false,
            }, {
                header: 'Color',
                dataIndex: 'color',
                width: 40,
                editable: false,
                editor: new Ext.form.field.ComboBox({
                    typeAhead: true,
                    triggerAction: 'all',
                    store: [
                        ['Blue','blue'],
                        ['Red','red'],
                        ['Green','green'],
                        ['Orchid','orchid'],
                        ['Black','black']
                    ]
                }),
            }, {
                xtype: 'checkcolumn',
                header: 'Show',
                dataIndex: 'show',
                width: 40,
                stopSelection: false
            }, {
                xtype: 'actioncolumn',
                width: 20,
                sortable: false,
                menuDisabled: true,
                items: [{
                    icon: 'static/lib/ext/welcome/img/delete.png',
                    tooltip: 'Delete Plant',
                    scope: this,
                    handler: function(grid, rowIndex){
                        //this.getStore().removeAt(rowIndex);
                    },
                }]
        }],
        height: 398,
        width: 496,
    });
    
    /*functionSelector.addedFunctions = Ext.create('Ext.panel.Panel', {
        title: 'Added Functions',
        width: 496,
        height: 398,
        id: 6,
        autoScroll: true,
        bodyPadding: 50,
    });*/
    
    functionSelector.rangeLimit = Ext.create('Ext.tab.Panel', {
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
    
    /*if(!selection){
        console.log("s");
    }
    if(!addedFunctions){
        console.log("af");
    }
    if(!rangeLimit){
        console.log("rl");
    }*/
    
    var functionSelectionRanges = Ext.create('Ext.panel.Panel', {
        width: 350,
        height: 700,
        id: 7,
        layout: {type: 'vbox',
                align : 'stretch',
                pack  : 'start',
        },
        //renderTo: Ext.getBody(),
        items: [functionSelector.selection, functionSelector.addedFunctions, functionSelector.rangeLimit, ],
    });
    
    /*var plot = Ext.create('Ext.tab.Panel', {
        width: 450,
        height: 198,
        renderTo: document.body,
        items: [{
            title: 'Graph'
        }, {
            title: 'Grid',
            id: 'webfitTab',
            iconCls: '/static/img/silk/calculator.png',
            layout: 'hbox',
            items: [webfit.plotPanel],
        }]
    });*/
    
    plotPanel.fitResults = Ext.create('Ext.panel.Panel', {
        title: 'Fit Results',
        width: 150,
        id: 9,
        height: 300,
        autoScroll: true,
        
    });
    
    webfit.plotPanel = Ext.create('Ext.form.Panel', {
        //title: 'webfit Panel',
        labelWidth: 75, // label settings here cascade unless overridden
        url: 'save-form.php',
        frame: true,
        //bodyStyle: 'padding:5px 5px 0',
        width: 696,
        height: 300,
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
//            $.jqplot(this.body.id, data,
//                { title:'Server Load',
//                    axes:{xaxis:{renderer:$.jqplot.DateAxisRenderer}},
//                    series:[
//                        {label:'Awesome Level'}
//                    ]
//                });

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
                        color1: 'grey',
                        },
                        {type: 'Gaussian',
                        name: 'g2cursor',
                        x0: 0.0001,
                        color1: 'green',
                        color2: 'blue'
                        },
                ]

            });
            
            //WORKING LISTENER        
/*            mylistener=function() {};
            mylistener.update=function update(pos){
               console.log(pos.x,pos.y);      
            }
        //the pluginpoint name differs per interactor
            webfit.plot.plugins.interactors.lgcursor.pw.listeners.push(mylistener);
            this.callParent(arguments);*/
            //webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.gcursor);
            webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.lcursor);
            webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.gcursor);
            webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.g2cursor);
            //webfit.plot.plugins.interactors.fcursor.unregister(webfit.plot.plugins.interactors.lcursor);
            //webfit.plot.plugins.interactors.fcursor.unregister(webfit.plot.plugins.interactors.gcursor);
        }
    });
    
    var innerPlot = Ext.create('Ext.panel.Panel', {
        width: 450,
        height: 498,
        id: 10,
        //renderTo: Ext.getBody(),
        layout: {type: 'hbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [webfit.plotPanel, plotPanel.fitResults],
    });
    
    var residuals = Ext.create('Ext.panel.Panel', {
        title: 'Residuals',
        //width: 450,
        id: 11,
        height: 198,    
    });
    
    var plot = Ext.create('Ext.panel.Panel', {
        //width: 748,
        id: 12,
        height: 500,
        //renderTo: Ext.getBody(),
        layout: {type: 'vbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [innerPlot, residuals],
    });
    
    var workspace = Ext.create('Ext.panel.Panel', {
        width: 1200,
        id: 13,
        height: 700,
        renderTo: Ext.getBody(),
        layout: {type: 'hbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [functionSelectionRanges, plot],
    });
    
    /*console.log('workspace: ', workspace.id);
    console.log('functionSelectionRanges: ', functionSelectionRanges.id);
    console.log('plot: ', plot.id);
    console.log('residuals: ', residuals.id);
    console.log('innerPlot: ', innerPlot.id);
    console.log('plotPanel.fitResults: ', plotPanel.fitResults.id);
    console.log('rangeLimit: ', rangeLimit.id);
    console.log('addedFunctions: ', addedFunctions.id);
    console.log('selection: ', selection.id);
    console.log('functionSelector.add: ', functionSelector.add.id);
    console.log('functionSelector.chooser: ', functionSelector.chooser.id);
    console.log('toolbar: ', toolbar.id);*/  
    
    
});