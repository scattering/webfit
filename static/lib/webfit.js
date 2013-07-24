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
    //Ext.namespace("rangeLimiter");
    Ext.namespace("plotPanel");
    Ext.namespace("residualPanel");  
    Ext.namespace("toolbarFunctions");
    Ext.namespace('dataP');
    
    webfit.updatePlotData = function(files){
	var reader = new FileReader();
	for(var i = 0; i < files.length; i++){
	    var file = files[i];
	    if(!file.type.match('csv.*')){
		alert('Can only load csv files');
		continue;
	    }
	    reader.readAsText(file); 
	    reader.onload = function(event){
		var csv = event.target.result;
		var webfitData = webfit.plot.series[0].data;
		
		//CLEAR PREVIOUS DATA
		while(webfitData.length !== 0){
		    webfitData.pop();
		    console.log(webfitData.length);
		}
		if(dataP.store.data.items.length !== 0){
		    dataP.store.removeAll();
		}
		
		//webfit.plot.redraw();
		var data = $.csv.toArrays(csv);
		//var html = '';
		for(var row in data) {
		    webfitData.push(data[row]);
		    dataP.store.add({
			x: data[row][0],
			y: data[row][1],
		    });
		  //  var item={x: data[row][0],
		//	y: data[row][1],};
		    //dataP.store.add(Ext.create('dataModel', item);
		  //html += '<tr>\r\n';
		  //for(var item in data[row]) {
		    //html += '<td>' + data[row][item] + '</td>\r\n';
		  //}
		  //html += '</tr>\r\n';
		}
		dataPanel.getView().refresh();
		//$('#contents').html(html);
		webfit.plot.redraw();
	    };
	    reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
	}
	console.log('imported');
    }
    
    Ext.define('Ext.ux.upload.BrowseButton', {
	extend : 'Ext.form.field.File',
    
	buttonOnly : true,
    
	iconCls : 'ux-mu-icon-action-browse',
	buttonText : 'Import Data',
    
	initComponent : function() {
    
	    this.addEvents({
		'fileselected' : true
	    });
    
	    Ext.apply(this, {
		buttonConfig : {
		    iconCls : this.iconCls,
		    text : this.buttonText
		}
	    });
    
	    this.on('afterrender', function() {
		/*
		 * Fixing the issue when adding an icon to the button - the text does not render properly. OBSOLETE - from
		 * ExtJS v4.1 the internal implementation has changed, there is no button object anymore.
		 */
		if (this.iconCls) {
		    // this.button.removeCls('x-btn-icon');
		    // var width = this.button.getWidth();
		    // this.setWidth(width);
		}
    
		// Allow picking multiple files at once.
		this.fileInputEl.dom.setAttribute('multiple', '1');
    
	    }, this);
    
	    this.on('change', function(field, value, options) {
		var files = this.fileInputEl.dom.files;
		if (files) {
		    this.fireEvent('fileselected', this, files);
		    webfit.updatePlotData(files);
		}
	    }, this);
    
	    this.callParent(arguments);
	},
    
	// OBSOLETE - the method is not used by the superclass anymore
	createFileInput : function() {
	    this.callParent(arguments);
	    this.fileInputEl.dom.setAttribute('multiple', '1');
	},
    
    });
    
    toolbarFunctions.importData = Ext.create('Ext.ux.upload.BrowseButton', {
	
    });
    
    //THE START OF REDISPLAYING
    var toolbar = Ext.create('Ext.toolbar.Toolbar', {
        renderTo: Ext.getBody(),
        //id: 1,
        width: 1200,
        items: [
            {
                xtype: 'splitbutton',
                text : 'File',
                menu: new Ext.menu.Menu({
                    items: [toolbarFunctions.importData,
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
            { xtype: 'tbspacer', width: 45}, 'Untitled',
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
            //id: 2,
            data : [
                {"name":"Gaussian"},
                {"name":"Line"},
            ]
        }),
        //renderTo: Ext.getBody(),
        //id: 3,
        autoScroll: true,
        queryMode: 'local',
        displayField: 'name',
        editable: false,
	allowBlank: false,
        x: 22,
        y: 35,
    });
    
    addInteractor = function(functionType){
    
	var tcursor={
	    type: functionType, 
	    name: 'cursor'+webfit.plot.plugins.interactors.fcursor.interactors.length, 
	    x0: 0.0001,
	    color1: 'green',
	    color2: 'blue',
	};
	webfit.plot.options.interactors.push(tcursor);	//remove
	
    
	var name = tcursor.name;
	var newi = new $.jqplot.InteractorPluginSubtypes[tcursor.type]();
	webfit.plot.plugins.interactors[name] = newi;
	newi.init(tcursor);
	newi.plot = webfit.plot;
                //for (var j in newi.grobs) {
                //    this.plugins._interactor.grobs.push(newi.grobs[j]);
                //}
	webfit.plot.plugins._interactor.interactors.push(newi);	//remove
	webfit.plot.plugins.interactors.fcursor.register(newi);	//unregister first
	webfit.plot.redraw();
	
	return tcursor.name;
    }
    
    functionSelector.add = Ext.create('Ext.Button', {
        text: 'Add',
        //id: 4,
        //renderTo: Ext.getBody(),
        handler: function() {
	    if(functionSelector.chooser.getValue() === null){
		alert('You must choose a function before adding.');
	    }
	    else{
		var selection = functionSelector.chooser.getValue();
		var theName = addInteractor(selection);
		functionSelector.addStore.add({
		    name: theName,
		    type: selection,
		    color1: 'green',
		    color2: 'blue',
		    show: true,
		});
	    }
        },
        x: 292,
        y: 8,
    });
    
    functionSelector.selection = Ext.create('Ext.panel.Panel', {
        width: 496,
        height: 100,
        //id: 5,
        //height: 200,
        autoScroll: true,
        //bodyPadding: 50,
        items: [functionSelector.chooser, functionSelector.add],
    });
    
    functionSelector.addStore = Ext.create('Ext.data.Store', {
        fields: [
            {name: 'name', type: 'string'},
            {name: 'type', type: 'string'},
            {name: 'color1', type: 'string'},
	    {name: 'color2', type: 'string'},
            {name: 'show', type: 'boolean'},
        ],
        //id: 14,
        /*data : [
            {'name':'Gaussian0','type': 'Gaussian','color': 'green', 'show': true},
            {'name':'Gaussian1','type': 'Gaussian','color': 'green', 'show': true},
            {'name':'Line0','type': 'Line','color': 'green', 'show': true},
        ]*/
    });    
    
    functionSelector.addedFunctions = Ext.create('Ext.grid.Panel', {
        xtype: 'cell-editing',
        title: 'Added Functions',
        //id: 6,
        plugins: [new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1
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
                width: 80,
            }, {
                header: 'Color 1',
                dataIndex: 'color1',
                width: 50,
                editor: new Ext.form.field.ComboBox({
                    typeAhead: true,
                    triggerAction: 'all',
                    store: new Ext.data.Store({
                        fields: ['color'],
                        //id: 2,
                        queryMode: 'local',
                        data : [
                            {'color':"blue"},
                            {'color':"green"},
                            {'color':"red"},
                        ]
                    }),
                    displayField: 'color',
		    autoScroll: true,
		    editable: false,
		    queryMode: 'local',
		    allowBlank: false,
                }),
            }, {
                header: 'Color 2',
                dataIndex: 'color2',
                width: 50,
                editor: new Ext.form.field.ComboBox({
                    typeAhead: true,
                    triggerAction: 'all',
                    store: new Ext.data.Store({
                        fields: ['color'],
                        //id: 2,
                        queryMode: 'local',
                        data : [
                            {'color':"blue"},
                            {'color':"green"},
                            {'color':"red"},
                        ]
                    }),
                    displayField: 'color',
		    autoScroll: true,
		    editable: false,
		    queryMode: 'local',
		    allowBlank: false,
                }),
            }, {
                xtype: 'checkcolumn',
                header: 'Show',
                dataIndex: 'show',
                width: 40,
                stopSelection: false,
            }, {
                xtype: 'actioncolumn',
                width: 35,
                dataIndex: 'delete',
                sortable: false,
                align: 'center',
                menuDisabled: true,
                items: [{
                    icon: 'static/lib/ext/welcome/img/delete.png',
                    tooltip: 'Delete Plant',
                    scope: this,
                    handler: function(grid, rowIndex){
			var removed = functionSelector.addedFunctions.getStore().data.removeAt(rowIndex);
			var removedInteractor = webfit.plot.plugins.interactors.fcursor.unregister(removed.data.name);
			
			var indexPlugins = webfit.plot.plugins._interactor.interactors.indexOf(removedInteractor)
			if(indexPlugins === webfit.plot.plugins._interactor.interactors.length-1){
			    webfit.plot.plugins._interactor.interactors.pop();
			}
			else if(indexPlugins !== -1){
			    for(var i = indexPlugins; i < webfit.plot.plugins._interactor.interactors.length; i++){
				webfit.plot.plugins._interactor.interactors[i] = webfit.plot.plugins._interactor.interactors[i+1];
			    }
			}
			
			/*var tcursor={
			    type: removed.data.type, 
			    name: removed.data.name, 
			    x0: 0.0001,
			    color1: removed.data.color1,
			    color2: removed.data.color2,
			    __proto__: Object
			};*/
			
			//DOES NOT WORK
			//var indexOptions = webfit.plot.options.interactors.indexOf(tcursor);
			var indexOptions = -1;
			for(var i = 0; i < webfit.plot.options.interactors.length; i++){
			    console.log(webfit.plot.options.interactors[i].name);
			    if(webfit.plot.options.interactors[i].name === removed.data.name){
				indexOptions = i;
			    }
			}
			if(indexOptions === webfit.plot.options.interactors.length-1){
			    console.log('last complete');
			    webfit.plot.options.interactors.pop();
			}
			else if(indexOptions !== -1){
			    for(var i = indexOptions; i < webfit.plot.options.interactors.length; i++){
				webfit.plot.options.interactors[i] = webfit.plot.options.interactors[i+1];
			    }
			}
			functionSelector.addedFunctions.getStore().removeAt(rowIndex);
			console.log('Deleted');
			webfit.plot.redraw();
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
    
    functionSelector.plot = Ext.create('Ext.panel.Panel', {
	html: 'Plot',
	width: 70,
	border:false,
	bodyBorder:false,
	hideBorders:true
    });    
    
    functionSelector.plotRange = Ext.create('Ext.panel.Panel', {
	//width:2,
	height: 45,
	layout: {type: 'hbox',
	    align : 'stretch',
	    pack  : 'start',
	},
	border:false,
	bodyBorder:false,
	hideBorders:true,
	items: [functionSelector.plot, {
		xtype: 'textfield',
		name: 'plotXMin',
		//enforceMaxLength: true,
		width: 105,
		//padding: '0 0 0 0', //top, right, down, left (right doesn't work?)
		labelAlign: 'top',
		fieldLabel: 'X Min',
		allowBlank: false  // requires a non-empty value
	    }, {
		xtype: 'textfield',
		name: 'plotXMax',
		width: 105,
		padding: '0 0 0 20',
		labelAlign: 'top',
		fieldLabel: 'X Max',
		allowBlank: false,
	}]
    });
    
    functionSelector.residuals = Ext.create('Ext.panel.Panel', {
	html: 'Residuals',
	width: 70,
	border:false,
	bodyBorder:false,
	hideBorders:true
    });    
    
    functionSelector.residualsRange = Ext.create('Ext.panel.Panel', {
	//width:2,
	height: 60,
	layout: {type: 'hbox',
	    align : 'stretch',
	    pack  : 'start',
	},
	border:false,
	padding: '15 0 0 0',
	bodyBorder:false,
	hideBorders:true,
	items: [functionSelector.residuals, {
		xtype: 'textfield',
		name: 'residualsXMin',
		//enforceMaxLength: true,
		width: 105,
		//padding: '0 0 0 0', //top, right, down, left (right doesn't work?)
		labelAlign: 'top',
		fieldLabel: 'X Min',
		allowBlank: false  // requires a non-empty value
	    }, {
		xtype: 'textfield',
		name: 'residualsXMax',
		width: 105,
		padding: '0 0 0 20',
		labelAlign: 'top',
		fieldLabel: 'X Max',
		allowBlank: false,
	}]
    });
    
    functionSelector.plot1 = Ext.create('Ext.panel.Panel', {
	html: 'Plot',
	width: 70,
	border:false,
	bodyBorder:false,
	hideBorders:true
    });   
    
    functionSelector.plotDomain = Ext.create('Ext.panel.Panel', {
	height: 45,
	layout: {type: 'hbox',
	    align : 'stretch',
	    pack  : 'start',
	},
	border:false,
	bodyBorder:false,
	hideBorders:true,
	items: [functionSelector.plot1, {
		xtype: 'textfield',
		name: 'plotYMin',
		width: 105,
		labelAlign: 'top',
		fieldLabel: 'Y Min',
		allowBlank: false  // requires a non-empty value
	    }, {
		xtype: 'textfield',
		name: 'plotYMax',
		width: 105,
		padding: '0 0 0 20',
		labelAlign: 'top',
		fieldLabel: 'Y Max',
		allowBlank: false,
	}]
    });
    
    functionSelector.residuals1 = Ext.create('Ext.panel.Panel', {
	html: 'Residuals',
	width: 70,
	border:false,
	bodyBorder:false,
	hideBorders:true
    });   
    
    functionSelector.residualsDomain = Ext.create('Ext.panel.Panel', {
	height: 60,
	layout: {type: 'hbox',
	    align : 'stretch',
	    pack  : 'start',
	},
	border:false,
	padding: '15 0 0 0',
	bodyBorder:false,
	hideBorders:true,
	items: [functionSelector.residuals1, {
		xtype: 'textfield',
		name: 'residualsYMin',
		width: 105,
		labelAlign: 'top',
		fieldLabel: 'Y Min',
		allowBlank: false  // requires a non-empty value
	    }, {
		xtype: 'textfield',
		name: 'residualsYMax',
		width: 105,
		padding: '0 0 0 20',
		labelAlign: 'top',
		fieldLabel: 'Y Max',
		allowBlank: false,
	}]
    });
    
    functionSelector.axisNames = Ext.create('Ext.panel.Panel', {
	height: 150,
	layout: {type: 'vbox',
	    align : 'stretch',
	    pack  : 'center',
	},
	border:false,
	//padding: '15 0 0 0',
	bodyBorder:false,
	hideBorders:true,
	items: [{
		xtype: 'textfield',
		name: 'title',
		width: 110,
		labelPad: -30,
		labelAlign: 'left',
		fieldLabel: 'Title',
		allowBlank: false  // requires a non-empty value
	    }, {
		xtype: 'textfield',
		name: 'xAxis',
		width: 110,
		labelPad: -30,
		//padding: '0 0 0 20',
		labelAlign: 'left',
		fieldLabel: 'X-Axis',
		allowBlank: false,
	}, {
		xtype: 'textfield',
		name: 'yAxis',
		width: 110,
		labelPad: -30,
		//padding: '0 0 0 20',
		labelAlign: 'left',
		fieldLabel: 'Y-Axis',
		allowBlank: false,
	}],
	handler: function() {
	    
	}
    });
    
    functionSelector.rangeDomainAxis = Ext.create('Ext.tab.Panel', {
        width: 450,
        height: 198,
        //id: 8,
        items: [{
                title: 'Range',
                bodyPadding: 15,
                layout: {type: 'vbox',
                    align : 'stretch',
                    pack  : 'center',
                },
                items: [functionSelector.plotRange, functionSelector.residualsRange, ],
		//PLOTRANGE: ["panel-1064", "textfield-1066", "textfield-1067"]
		//RESIDUALSRANGE: ["panel-1068", "textfield-1070", "textfield-1071"]
		buttons: [{
		    text: 'Update',
		    handler: function() {
			plotxmin = Math.floor(functionSelector.plotRange.items.getByKey('textfield-1061').getValue());
			plotxmax = Math.floor(functionSelector.plotRange.items.getByKey('textfield-1062').getValue());
			residxmin = Math.floor(functionSelector.residualsRange.items.getByKey('textfield-1065').getValue());
			residxmax = Math.floor(functionSelector.residualsRange.items.getByKey('textfield-1066').getValue());
			
			if(plotxmin === 0 || plotxmax === 0 || residxmin === 0 || residxmax === 0){
			    alert('You must fill in all the fields first!');
			}
			//TODO 
			else{
			    console.log('in else');
			    
			    var data = webfit.plot.data.pop();
			    for(var i=0; i < data.length; i++){
				var point = data.pop();
				if(point[0] >= plotxmin && point[0] <= plotxmax){
				    data.push(point);
				}
			    }
			    webfit.plot.data.push(data);
			    webfit.plot.redraw();
			    
			    var dataR = webfit.ResidualPlot.data.pop();
			    for(var i=0; i < dataR.length; i++){
				var pointR = dataR.pop();
				if((pointR[0] >= residxmin && pointR[0] <= residxmax) || (pointR[0] >= plotxmin && pointR[0] <= plotxmax)){
				    dataR.push(pointR);
				}
			    }
			    webfit.ResidualPlot.data.push(dataR);
			    webfit.ResidualPlot.redraw();
			}
		    }
		}]
            }, {
                title: 'Domain',
                bodyPadding: 15,
                layout: {type: 'vbox',
                    align : 'stretch',
                    pack  : 'center',
                },
                items: [functionSelector.plotDomain, functionSelector.residualsDomain, ],
		buttons: [{
		    text: 'Update',
		    handler: function() {
			//alert('You clicked the button!')
		    }
		}]
            }, {
                title: 'Axis Names',
		//bodyPadding: 20,
		padding: '0 50 0 50',
                layout: {type: 'vbox',
                    align : 'stretch',
                    pack  : 'center',
                },
		items: [functionSelector.axisNames],
		//KEYS:["textfield-1081", "textfield-1082", "textfield-1083"]
		buttons: [{
		    text: 'Update',
		    handler: function() {
			webfit.plot.axes.xaxis.label = functionSelector.axisNames.items.getByKey("textfield-1082").getValue();
			webfit.plot.title.text = functionSelector.axisNames.items.getByKey("textfield-1081").getValue();
			webfit.plot.redraw();
			//can't refresh?
		    }
		}]
        }]
    });
    
    var functionSelectionRanges = Ext.create('Ext.panel.Panel', {
        width: 350,
        height: 700,
        //id: 7,
        layout: {type: 'vbox',
                align : 'stretch',
                pack  : 'start',
        },
        //renderTo: Ext.getBody(),
        items: [functionSelector.selection, functionSelector.addedFunctions, functionSelector.rangeDomainAxis, ],
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
	html: '<BR>',
        //id: 9,
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
        afterComponentLayout: function(width, height){
	    if(webfit.plot === undefined){
		var sinPoints = [];
		for (var i=0; i<2*Math.PI; i+=0.4){
		    sinPoints.push([i, 2*Math.sin(i-.8)]);
		}
		
		webfit.plot = $.jqplot (this.body.id, [sinPoints], {
		    //setTitle: function(newTitle){title: newTitle},
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
		    interactors: [/*{type: 'Line', 
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
			    },*/
			    {type: 'FunctionCollection',
			    name:'fcursor',
			    x0: 0.0001,
			    color1: 'grey',
			    },
			    /*{type: 'Gaussian',
			    name: 'g2cursor',
			    x0: 0.0001,
			    color1: 'green',
			    color2: 'blue'
			    },*/
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
		//webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.lcursor);
		//webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.gcursor);
		//webfit.plot.plugins.interactors.fcursor.register(webfit.plot.plugins.interactors.g2cursor);
		//webfit.plot.plugins.interactors.fcursor.unregister(webfit.plot.plugins.interactors.lcursor);
		//webfit.plot.plugins.interactors.fcursor.unregister(webfit.plot.plugins.interactors.gcursor);
	    }
	}
    });
    
    var innerPlot = Ext.create('Ext.panel.Panel', {
        width: 450,
        height: 498,
        //id: 10,
        //renderTo: Ext.getBody(),
        layout: {type: 'hbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [webfit.plotPanel, plotPanel.fitResults],
    });
    
    var residualUpdate = function(){
	var dataPoints = [];
	var data = webfit.plot.data[0];
	for (var i = 0; i < data.length; i++){
	    var point = data[i];
	    var fColPlugin = webfit.plot.plugins.interactors.fcursor;
	    var calcy=fColPlugin.sum.call(fColPlugin.FunctionCollection, point[0]);
	    //var calcy=webfit.plot.plugins.interactors.fcursor.sum.call($.jqplot.FunctionCollection,point[0]);
	    dataPoints.push(point[0], point[1] - calcy);
	}
	return dataPoints;
    };
    
    var residuals = Ext.create('Ext.panel.Panel', {
        title: 'Residuals',
        width: 100,
        //id: 11,
        height: 198,    
	frame: true,
	layout:  { type: 'fit',
            //align: 'center'
        },
	afterComponentLayout: function(width, height){
	
            /*var data = [['1/2012', 50],['2/2012', 66],['3/2012', 75]];*/
            $('#'+this.body.id).empty();
	    /*var sinPoints = [];
            for (var i=0; i<2*Math.PI; i+=0.4){
                sinPoints.push([i, 2*Math.sin(i-.8)]);
            }*/
	    var dataPoints = residualUpdate();
	    
            webfit.ResidualPlot = $.jqplot (this.body.id, [dataPoints], {
                //title: 'Scan space',
                /*series: [ {shadow: false,
                           color: 'red',
                           markerOptions: {shadow: false, size: 4},
                           showLine:false
                           }],*/
                grid: {shadow: false},
                sortData: false,
                axes:{
                    xaxis:{
                        label: 'X',
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {
                            formatString: "%.2g"
                        }
                    },
		    
                    yaxis:{
                        label: 'Y',
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

            });
        }
    });
    
    var plot = Ext.create('Ext.panel.Panel', {
        width: 848,
        //id: 12,
        height: 500,
        //renderTo: Ext.getBody(),
        layout: {type: 'vbox',
                align : 'stretch',
                pack  : 'start',
        },
        items: [innerPlot, residuals],
    });
    
    
 //Ext.regModel('dataModel', {
        //fields:[
            //{name:'', type:'number'},
            //{name:'y', type:'number'},
            //{name:'k', type:'number'},
            //{name:'l', type:'number'},
            //{name:'|F|', type:'number'}
        //]
    //});
    
   dataP.store = Ext.create('Ext.data.Store', {
        fields: [
            {name: 'x', type: 'number'},
            {name: 'y', type: 'number'},
        ],
    });  
    
    var dataPanel = Ext.create('Ext.grid.Panel', {
        //xtype: 'cell-editing',
        //title: 'Added Functions',
        //id: 6,
        plugins: [new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1
        })],
        autoScroll: true,
        store: dataP.store,
        columns: [{
                header: 'X',
                dataIndex: 'x',
                flex: 1,
		enableKeyEvents: true,
                editor: {
                    allowBlank: false,
                },
		handler: function(grid, rowIndex){
		    webfit.plot.series[0].data[rowIndex][0] = dataP.store.data.items[rowIndex].data.x;
		    webfit.plot.redraw();
		}
            }, {
                header: 'Y',
                dataIndex: 'y',
                flex: 1,
		editor: {
                    allowBlank: false
                }
            }, {
                xtype: 'actioncolumn',
                width: 35,
                dataIndex: 'delete',
                sortable: false,
                align: 'center',
                menuDisabled: true,
                items: [{
                    icon: 'static/lib/ext/welcome/img/delete.png',
                    tooltip: 'Delete Plant',
                    scope: this,
                    handler: function(grid, rowIndex){
			var removed = dataPanel.getStore().data.removeAt(rowIndex);
			
			dataPanel.getStore().removeAt(rowIndex);
			console.log('Deleted');
                    },
                }]
        }],
    });
    
    dataP.updatePlot = function(store, record, operation, modifiedFieldNames, eOpts ) {
		console.log("updating");
                switch(operation) {
                    case Ext.data.Model.EDIT:
                        console.log('INFO', 'Updating record...');
			var data = dataP.store.data.items;
			for(var row = 0; row < data.length; row++){
			    if(data[row].data.x === record.data.x && data[row].data.y === record.data.y){
				break;
			    }
			}
			webfit.plot.series[0].data[row][0] = (String)(record.data.x);
			webfit.plot.series[0].data[row][1] = (String)(record.data.y);
			webfit.plot.redraw();
                        break;
                    case Ext.data.Model.COMMIT:
                        console.log('INFO', 'Record successfully sent to server!');
                        break;
                    case Ext.data.Model.REJECT:
                        console.log('ERR', 'Something went horribly wrong :( Data was rejected by the server!');
                        break;
                }
            };
    
    dataP.store.on("update", dataP.updatePlot, dataPanel);
    
    var workspace = Ext.create('Ext.tab.Panel', {
        width: 1200,
        //id: 13,
        height: 700,
        renderTo: Ext.getBody(),
	items: [{
		title: 'Workspace',
		layout: {type: 'hbox',
		    align : 'stretch',
		    pack  : 'start',
		},
		items: [functionSelectionRanges, plot],
	    },{
		title: 'Data',
		items: [dataPanel],
	    },{
		title: 'Help Manual',
	    }],

    });
    
});