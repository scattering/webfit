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
    ], function () {
        // Add csrf token to every ajax request
        var token = Ext.util.Cookies.get('csrftoken');
        if (!token) {
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

    webfit.updatePlotData = function (files) {
        var reader = new FileReader();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            //if(!file.type.match('csv.*')){
            //	alert('Can only load csv files');
            //	continue;
            //  }
            reader.readAsText(file);
            reader.onload = function (event) {
                var csv = event.target.result;
                var webfitData = webfit.plot.series[0].data;
                var residualData = webfit.ResidualPlot.series[0].data;

                //CLEAR PREVIOUS DATA
                while (webfitData.length !== 0) {
                    webfitData.pop();
                    residualData.pop();
                    console.log(webfitData.length);
                }
                if (dataP.store.data.items.length !== 0) {
                    dataP.store.removeAll();
                }

                //webfit.plot.redraw();
                var data = $.csv.toArrays(csv);
                //var html = '';
                for (var row in data) {
                    webfitData.push(data[row]);
                    residualData.push(data[row]);
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
                webfit.ResidualPlot.replot();
                console.log("UPDATING PLOTS");
            };
            reader.onerror = function () {
                alert('Unable to read ' + file.fileName);
            };
        }
        console.log('imported');
    };

    Ext.define('Ext.ux.upload.BrowseButton', {
        extend: 'Ext.form.field.File',

        buttonOnly: true,
        renderTo: Ext.getBody(),
        iconCls: 'ux-mu-icon-action-browse',
        buttonText: 'Import Data',

        initComponent: function () {

            this.addEvents({
                'fileselected': true
            });

            Ext.apply(this, {
                buttonConfig: {
                    iconCls: this.iconCls,
                    text: this.buttonText
                }
            });

            this.on('afterrender', function () {
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

            this.on('change', function (field, value, options) {
                var files = this.fileInputEl.dom.files;
                if (files) {
                    this.fireEvent('fileselected', this, files);
                    webfit.updatePlotData(files);
                }
            }, this);

            this.callParent(arguments);
        },

        // OBSOLETE - the method is not used by the superclass anymore
        createFileInput: function () {
            this.callParent(arguments);
            this.fileInputEl.dom.setAttribute('multiple', '1');
        },

    });
    /*Ext.define('Ext.ux.upload.BrowseButton', {
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


                if (this.iconCls) {
                    // this.button.removeCls('x-btn-icon');
                    // var width = this.button.getWidth();
                    // this.setWidth(width);
                }

                // Allow picking multiple files at once.   Actually, for now, only allow one file.
                this.fileInputEl.dom.setAttribute('multiple', '0');

            }, this);

            this.on('change', function(field, value, options) {
                var files = this.fileInputEl.dom.files;
                if (files) {
                    this.fireEvent('fileselected', this, files);
                    var reader=new FileReader();
                    reader.readAsText(files);
                    reader.onload=function(event){
                        webfit.plot.data=[];
                        var csv=event.target.result;
                        var data= $.csv.toArray(csv);
                        for(var row in data){
                            webfit.plot.data.push[data[row][0], data[row][1]];
                        }

                    };
                    reader.onerror = function(){ alert('Unable to read ' + files.fileName); };
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
*/
    //var importDataButton = Ext.create('Ext.ux.upload.BrowseButton', {
//});
    /*toolbarFunctions.importData = Ext.create('Ext.ux.upload.BrowseButton', {

    });*/

    //THE START OF REDISPLAYING
    var toolbar = Ext.create('Ext.toolbar.Toolbar', {
        renderTo: Ext.getBody(),
        //id: 1,
        width: 1200,
        items: [
            {
                xtype: 'splitbutton',
                text: 'File',
                menu: new Ext.menu.Menu({
                    items: [  Ext.create('Ext.ux.upload.BrowseButton', {
                    }),
                        {text: 'Export Graph', handler: function () {
                        }},
                        //{text: 'Save', handler: function(){  }},
                        //{text: 'Save As', handler: function(){  }},
                    ]
                })
            },
            { xtype: 'tbspacer', width: 45},
            {
                xtype: 'splitbutton',
                text: 'Edit',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'Undo', handler: function () {
                        }},
                        {text: 'Redo', handler: function () {
                        }},
                    ]
                })
            },
            { xtype: 'tbspacer', width: 45},
            {
                xtype: 'splitbutton',
                text: 'View',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'Show',
                            handler: function () {
                            },
                            menu: new Ext.menu.Menu({
                                items: [
                                    {
                                        xtype: 'menucheckitem',
                                        text: 'Fit Results',
                                        checked: true,
                                    },
                                    {
                                        xtype: 'menucheckitem',
                                        text: 'Residuals',
                                        checked: true,
                                    },
                                    {
                                        xtype: 'menucheckitem',
                                        text: 'Limits',
                                        checked: true,
                                    },
                                ]
                            })}, //show list
                    ]
                })
            },
            { xtype: 'tbspacer', width: 45},
            {
                xtype: 'splitbutton',
                text: 'Fit Controls',
                menu: new Ext.menu.Menu({
                    items: [
                        {text: 'Specifications', handler: function () {
                            functionSelector.specs.setVisible(true);
                        }},
                        //{text: 'Remove Function Options', handler: function(){  }},
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
            //id: 2,
            data: [
                {"name": "Gaussian"},
                {"name": "Line"},
                {"name": "New Function"},
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

    var addInteractor = function (functionType) {

        var tcursor = {
            type: functionType,
            name: 'cursor' + webfit.plot.plugins.interactors.fcursor.interactors.length,
            xmin: 0.0001,
            xmin: webfit.plot.axes.xaxis.min,
            xmax: webfit.plot.axes.xaxis.max,
            ymin: webfit.plot.axes.yaxis.min,
            ymax: webfit.plot.axes.yaxis.max,
            color1: 'green',
            color2: 'blue',
            plot: webfit.plot,
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

        //UPDATE RESIDUALS
        webfit.ResidualPlot.series[0].data = residualUpdate();
        webfit.ResidualPlot.replot();
        console.log('UPDATED RESIDUALS');

        return tcursor.name;
    }

    functionSelector.params = function (functionName) {
        var store = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'name', type: 'string'},
                {name: 'fixed', type: 'boolean'},
                {name: 'val', type: 'string'},
                {name: 'bounded', type: 'boolean'},
                {name: 'up', type: 'string'},
                {name: 'low', type: 'string'},
                {name: 'tied', type: 'boolean'},
                {name: 'relationship', type: 'string'},
            ],
            data: [
                {'name': functionName, 'fixed': false, 'val': '', 'bounded': false, 'up': '', 'low': '', 'tied': false, 'relationship': ''},
                {'name': 'Center', 'fixed': false, 'val': '', 'bounded': false, 'up': '', 'low': '', 'tied': false, 'relationship': ''},
                {'name': 'Width', 'fixed': false, 'val': '', 'bounded': false, 'up': '', 'low': '', 'tied': false, 'relationship': ''},
            ]
        });
        return store;
    }

    functionSelector.specsLayout = function (functionName) {
        var panel = Ext.create('Ext.panel.Panel', {
            height: 101,
            width: 480,
            border: false,
            //autoScroll: true,
            bodyBorder: false,
            hideBorders: true,
            layout: {type: 'vbox',
                align: 'stretch',
                pack: 'start',
            },
            items: [
                /*{
                 xtype: 'label',
                 //forId: 'myFieldId',
                 text: functionName,
                 //margins: '0 0 0 10'
                 },*/{
                    xtype: 'gridpanel',
                    layout: {type: 'hbox',
                        align: 'stretch',
                        pack: 'start',
                    },
                    plugins: [new Ext.grid.plugin.CellEditing({
                        clicksToEdit: 1
                    })],
                    //autoScroll: true,
                    store: functionSelector.params(functionName),
                    columns: [
                        {
                            //header: '',
                            dataIndex: 'name',
                            width: 70,
                            editable: false,
                            /*editor: {
                             allowBlank: false
                             }*/
                        },
                        {
                            xtype: 'checkcolumn',
                            header: 'Fixed',
                            dataIndex: 'fixed',
                            width: 40,
                            stopSelection: false,
                        },
                        {
                            header: 'Value',
                            dataIndex: 'val',
                            width: 40,
                            editor: {
                            }
                        },
                        {
                            xtype: 'checkcolumn',
                            header: 'Bounded',
                            dataIndex: 'bounded',
                            width: 60,
                            stopSelection: false,
                        },
                        {
                            header: 'Upper',
                            dataIndex: 'up',
                            width: 40,
                            editor: {
                            }
                        },
                        {
                            header: 'Lower',
                            dataIndex: 'low',
                            width: 40,
                            editor: {
                            }
                        },
                        {
                            xtype: 'checkcolumn',
                            header: 'Tied To',
                            dataIndex: 'tied',
                            width: 50,
                            stopSelection: false,
                        },
                        {
                            dataIndex: 'relationship',
                            flex: 1,
                            editor: {
                            }
                        },
                    ],
                    height: 398,
                    width: 496,
                },
            ]
        });
        return panel;
    }

    functionSelector.specs = Ext.create('Ext.window.Window', {
        title: 'Specifications',
        width: 500,
        height: 300,
        closeAction: 'hide',
        autoScroll: true,
        layout: {type: 'vbox',
            align: 'stretch',
            pack: 'start',
        },
        buttons: [
            {
                text: 'Apply'
            }
        ],
    });

    functionSelector.add = Ext.create('Ext.Button', {
        text: 'Add',
        //id: 4,
        //renderTo: Ext.getBody(),
        handler: function () {
            if (functionSelector.chooser.getValue() === null) {
                alert('You must choose a function before adding.');
            }
            else {
                var selection = functionSelector.chooser.getValue();
                if (selection === "New Function") {
                    functionSelector.newFunction.setVisible(true);
                }
                else {
                    var theName = addInteractor(selection);
                    functionSelector.addStore.add({
                        name: theName,
                        type: selection,
                        color1: 'green',
                        color2: 'blue',
                        show: true,
                    });
                }
                functionSelector.specs.items.add(functionSelector.specsLayout(theName));
            }
        },
        x: 292,
        y: 8,
    });
    functionSelector.fit1 = Ext.create('Ext.Button', {
        text: 'Simplex Fit',
        //id: 4,
        //renderTo: Ext.getBody(),
        handler: function () {
            //functionSelector.currentlyFitting.setVisible(true);
            this.x0 = [];
            for (i = 0; i < webfit.plot.plugins.interactors.fcursor.interactors.length; i++) {
                for (j = 0; j < webfit.plot.plugins.interactors.fcursor.interactors[i].grobs.length - 1; j++) {
                    this.x0.push(webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.x);
                    this.x0.push(webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.y);
                }
            }
            //var a = webfit.plot.plugins.interactors.fcursor.FunctionCollection.g;
            var fitMin = -9999;
            var fitMax = 9999;
            if (functionSelector.plotFitDomain.items.getAt(1).getValue() != functionSelector.plotFitDomain.items.getAt(2).getValue()) {
                fitMin = functionSelector.plotFitDomain.items.getAt(1).getValue();
                fitMax = functionSelector.plotFitDomain.items.getAt(2).getValue();
            }
            var sqResid = function (x) {
                //a = webfit.plot.plugins.interactors.fcursor.FunctionCollection.g
                var counter = 0;
                for (i = 0; i < webfit.plot.plugins.interactors.fcursor.interactors.length; i++) {
                    for (j = 0; j < webfit.plot.plugins.interactors.fcursor.interactors[i].grobs.length - 1; j++) {
                        webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.x = x[counter];
                        counter++;
                        webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.y = x[counter];
                        counter++;
                        webfit.plot.replot();

                    }
                }
                var sqRes = 0;
                for (i = 0; i < webfit.plot.data[0].length; i++) {
                    if (webfit.plot.data[0][i][0] > fitMin && webfit.plot.data[0][i][0] < fitMax) {


                        sqRes += Math.pow(webfit.plot.plugins.interactors.fcursor.FunctionCollection.f(webfit.plot.data[0][i][0]) - webfit.plot.data[0][i][1], 2); //fix this
                    }
                    //console.log(sqRes);
                }
                console.log(sqRes);
                //console.log("y:"+a(webfit.plot.data[0][i][0])+" y0:"+webfit.plot.data[i][1]+" res:"+sqRes);
                return sqRes;


            };

            var x = SimplexEq.simplex(sqResid, this.x0);
            residualUpdate();
            webfit.ResidualPlot.replot();
            console.log('UPDATING RESIDUALS');
            //fit the function

        },
        x: 40,
        y: 38,
    });
    functionSelector.fit2 = Ext.create('Ext.Button', {
        text: 'L-M Fit',
        //id: 4,
        //renderTo: Ext.getBody(),
        handler: function () {
            this.p = [];
            var fitMin = -9999;
            var fitMax = 9999;
            if (functionSelector.plotFitDomain.items.getAt(1).getValue() != functionSelector.plotFitDomain.items.getAt(2).getValue()) {
                fitMin = functionSelector.plotFitDomain.items.getAt(1).getValue();
                fitMax = functionSelector.plotFitDomain.items.getAt(2).getValue();
            }
            var x1 = [], y1 = [];
            for (i = 0; i < webfit.plot.data[0].length; i++) {
                if (webfit.plot.data[0][i][0] > fitMin && webfit.plot.data[0][i][0] < fitMax) {
                    x1.push(webfit.plot.data[0][i][0]);
                    y1.push(webfit.plot.data[0][i][1]);
                }
                //console.log(sqRes);
            }
            for (i = 0; i < webfit.plot.plugins.interactors.fcursor.interactors.length; i++) {
                for (j = 0; j < webfit.plot.plugins.interactors.fcursor.interactors[i].grobs.length - 1; j++) {
                    this.p.push(webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.x);
                    this.p.push(webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.y);
                }
            }

            var sqResid = function (p, fjac, x, y, err) {
                //a = webfit.plot.plugins.interactors.fcursor.FunctionCollection.g
                var counter = 0;
                for (i = 0; i < webfit.plot.plugins.interactors.fcursor.interactors.length; i++) {
                    for (j = 0; j < webfit.plot.plugins.interactors.fcursor.interactors[i].grobs.length - 1; j++) {
                        webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.x = p[counter];
                        counter++;
                        webfit.plot.plugins.interactors.fcursor.interactors[i].grobs[j].coords.y = p[counter];
                        counter++;
                        webfit.plot.replot();
                        webfit.ResidualPlot.replot();

                    }
                }
                var sqRes = [];
                for (i = 0; i < webfit.plot.data[0].length; i++) {
                    if (webfit.plot.data[0][i][0] > fitMin && webfit.plot.data[0][i][0] < fitMax) {


                        sqRes.push(Math.pow(webfit.plot.plugins.interactors.fcursor.FunctionCollection.f(x[i]) - y[i], 2)); //fix this
                    }
                    //console.log(sqRes);
                }
                //console.log(sqRes);
                var status = 0;
                //console.log("y:"+a(webfit.plot.data[0][i][0])+" y0:"+webfit.plot.data[i][1]+" res:"+sqRes);
                return {status: status, f: sqRes};
            };
            var fa = {};
            fa['x'] = x1;
            fa['y'] = y1;
            var x = lmfit.lmfit(sqResid, this.p, fa);
            webfit.ResidualPlot.replot();
            console.log('UPDATING RESIDUALS');
            //fit the function
        },
        x: 120,
        y: 38,
    });

    functionSelector.selection = Ext.create('Ext.panel.Panel', {
        width: 496,
        height: 100,
        //id: 5,
        //height: 200,
        autoScroll: true,
        //bodyPadding: 50,
        items: [functionSelector.chooser, functionSelector.add, functionSelector.fit1, functionSelector.fit2],
    });

    functionSelector.addStore = Ext.create('Ext.data.Store', {
        fields: [
            {name: 'name', type: 'string'},
            {name: 'type', type: 'string'},
            {name: 'color1', type: 'string'},
            {name: 'color2', type: 'string'},
            {name: 'show', type: 'boolean'},
        ],
    });

    functionSelector.newFunction = Ext.create('Ext.window.Window', {
        title: 'Add a New Function',
        width: 500,
        height: 300,
        closeAction: 'hide',
        items: [
            {
                xtype: 'textfield',
                name: 'newfunc',
                width: 480,
                height: 230,
                //padding: '0 0 0 20',
                labelAlign: 'top',
                fieldLabel: 'Type in javascript:',
                autoScroll: true,

                //allowBlank: false,
            }
        ],
        buttons: [
            {
                text: 'Add',
                handler: function () {

                },
            }
        ],
    });

    functionSelector.currentlyFitting = Ext.create('Ext.window.Window', {
        //title: 'Specifications',
        width: 200,
        height: 100,
        html: 'fitting...',
        closeAction: 'hide',
        autoScroll: true,
        bodyPadding: 50,
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
        columns: [
            {
                header: 'Function Name',
                dataIndex: 'name',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            },
            {
                header: 'Function Type',
                dataIndex: 'type',
                width: 80,
            },
            {
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
                        data: [
                            {'color': "blue"},
                            {'color': "green"},
                            {'color': "red"},
                        ]
                    }),
                    displayField: 'color',
                    autoScroll: true,
                    editable: false,
                    queryMode: 'local',
                    allowBlank: false,
                    listeners: {
                        click: {
                            element: 'el', //bind to the underlying el property on the panel
                            fn: function () {
                                console.log('click el');
                            }
                        },
                    },
                }),
            },
            {
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
                        data: [
                            {'color': "blue"},
                            {'color': "green"},
                            {'color': "red"},
                        ]
                    }),
                    displayField: 'color',
                    autoScroll: true,
                    editable: false,
                    queryMode: 'local',
                    allowBlank: false,
                }),
            },
            {
                xtype: 'checkcolumn',
                header: 'Show',
                dataIndex: 'show',
                width: 40,
                stopSelection: false,
            },
            {
                xtype: 'actioncolumn',
                width: 35,
                dataIndex: 'delete',
                sortable: false,
                align: 'center',
                menuDisabled: true,
                items: [
                    {
                        icon: 'static/lib/ext/welcome/img/delete.png',
                        tooltip: 'Delete Plant',
                        scope: this,
                        handler: function (grid, rowIndex) {
                            var removed = functionSelector.addedFunctions.getStore().data.removeAt(rowIndex);
                            var removedInteractor = webfit.plot.plugins.interactors.fcursor.unregister(removed.data.name);

                            var indexPlugins = webfit.plot.plugins._interactor.interactors.indexOf(removedInteractor)
                            if (indexPlugins === webfit.plot.plugins._interactor.interactors.length - 1) {
                                webfit.plot.plugins._interactor.interactors.pop();
                            }
                            else if (indexPlugins !== -1) {
                                for (var i = indexPlugins; i < webfit.plot.plugins._interactor.interactors.length; i++) {
                                    webfit.plot.plugins._interactor.interactors[i] = webfit.plot.plugins._interactor.interactors[i + 1];
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
                            for (var i = 0; i < webfit.plot.options.interactors.length; i++) {
                                console.log(webfit.plot.options.interactors[i].name);
                                if (webfit.plot.options.interactors[i].name === removed.data.name) {
                                    indexOptions = i;
                                }
                            }
                            if (indexOptions === webfit.plot.options.interactors.length - 1) {
                                console.log('last complete');
                                webfit.plot.options.interactors.pop();
                            }
                            else if (indexOptions !== -1) {
                                for (var i = indexOptions; i < webfit.plot.options.interactors.length; i++) {
                                    webfit.plot.options.interactors[i] = webfit.plot.options.interactors[i + 1];
                                }
                            }
                            functionSelector.addedFunctions.getStore().removeAt(rowIndex);
                            console.log('Deleted');
                            webfit.plot.redraw();
                        },
                    }
                ]
            }
        ],
        tbar: [
            /*{
             text: 'Specifications',
             scope: this,
             handler: function(){
             functionSelector.specs.setVisible(true);
             },
             },*/ {
                text: 'Fit',
                width: 70,
                scope: this,
                handler: function () {
                    functionSelector.currentlyFitting.setVisible(true);
                },
            }
        ],
        height: 398,
        width: 496,
    });

    /*functionSelector.color1Select = function( combo, records, eOpts ) {

     };

     functionSelector.addedFunctions.columns[2].getEditor().on("select", functionSelector.color1Select, functionSelector.addedFunctions);*/

    functionSelector.plot = Ext.create('Ext.panel.Panel', {
        html: 'Plot',
        width: 70,
        border: false,
        bodyBorder: false,
        hideBorders: true
    });

    functionSelector.plotRange = Ext.create('Ext.panel.Panel', {
        //width:2,
        height: 45,
        layout: {type: 'hbox',
            align: 'stretch',
            pack: 'start',
        },
        border: false,
        bodyBorder: false,
        hideBorders: true,
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

    functionSelector.plot1 = Ext.create('Ext.panel.Panel', {
        html: 'Plot',
        width: 70,
        border: false,
        bodyBorder: false,
        hideBorders: true
    });

    functionSelector.axisNames = Ext.create('Ext.panel.Panel', {
        height: 150,
        layout: {type: 'vbox',
            align: 'stretch',
            pack: 'center',
        },
        border: false,
        //padding: '15 0 0 0',
        bodyBorder: false,
        hideBorders: true,
        items: [
            {
                xtype: 'textfield',
                name: 'title',
                width: 110,
                labelPad: -30,
                labelAlign: 'left',
                fieldLabel: 'Title',
                allowBlank: false  // requires a non-empty value
            },
            {
                xtype: 'textfield',
                name: 'xAxis',
                width: 110,
                labelPad: -30,
                //padding: '0 0 0 20',
                labelAlign: 'left',
                fieldLabel: 'X-Axis',
                allowBlank: false,
            },
            {
                xtype: 'textfield',
                name: 'yAxis',
                width: 110,
                labelPad: -30,
                //padding: '0 0 0 20',
                labelAlign: 'left',
                fieldLabel: 'Y-Axis',
                allowBlank: false,
            }
        ],
        handler: function () {

        }
    });

    functionSelector.plotFitDomain = Ext.create('Ext.panel.Panel', {
        height: 45,
        layout: {type: 'hbox',
            align: 'stretch',
            pack: 'start',
        },
        border: false,
        bodyBorder: false,
        hideBorders: true,
        items: [functionSelector.plot1, {
            xtype: 'textfield',
            name: 'plotXMin',
            width: 105,
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

    functionSelector.rangeDomainAxis = Ext.create('Ext.tab.Panel', {
        width: 450,
        height: 198,
        //id: 8,
        items: [
//            {
//                title: 'Range',
//                bodyPadding: 15,
//                layout: {type: 'vbox',
//                    align: 'stretch',
//                    pack: 'center',
//                },
//                items: [functionSelector.plotRange, ],
//                //PLOTRANGE: ["panel-1064", "textfield-1066", "textfield-1067"]
//                buttons: [
//                    {
//                        text: 'Update',
//                        handler: function () {
//                            plotxmin = Math.floor(functionSelector.plotRange.items.getAt(1).getValue());
//                            plotxmax = Math.floor(functionSelector.plotRange.items.getAt(2).getValue());
//                            console.log('min', plotxmin);
//                            console.log('max', plotxmax);
//
//                            webfit.plot.axes.xaxis.min = plotxmin;
//                            webfit.plot.axes.xaxis.max = plotxmax;
//                            webfit.ResidualPlot.axes.xaxis.min = plotxmin;
//                            webfit.ResidualPlot.axes.xaxis.max = plotxmax;
//                            webfit.plot.replot();
//                            webfit.ResidualPlot.replot();
//                        }
//                    }
//                ]
//            },
            {
                title: 'Fit Domain',
                bodyPadding: 15,
                layout: {type: 'vbox',
                    align: 'stretch',
                    pack: 'center',
                },
                items: [functionSelector.plotFitDomain, ],
                buttons: [
                    {
                        text: 'Update',
                        handler: function () {
//                            plotymin = Math.floor(functionSelector.plotFitDomain.items.getAt(1).getValue());
//                            plotymax = Math.floor(functionSelector.plotFitDomain.items.getAt(2).getValue());
//                            console.log('min', plotymin);
//                            console.log('max', plotymax);
//
//                            webfit.plot.axes.yaxis.min = plotymin;
//                            webfit.plot.axes.yaxis.max = plotymax;
//                            webfit.ResidualPlot.axes.yaxis.min = plotymin;
//                            webfit.ResidualPlot.axes.yaxis.max = plotymax;
//                            webfit.plot.replot();
//                            webfit.ResidualPlot.replot();
                            //alert('You clicked the button!')
                        }
                    }
                ]
            },
            {
                title: 'Axis Names',
                //bodyPadding: 20,
                padding: '0 50 0 50',
                layout: {type: 'vbox',
                    align: 'stretch',
                    pack: 'center',
                },
                items: [functionSelector.axisNames],
                //KEYS:["textfield-1081", "textfield-1082", "textfield-1083"]
                buttons: [
                    {
                        text: 'Update',
                        handler: function () {
                            var changeTit = functionSelector.axisNames.items.items[0].getValue();
                            var changeXLab = functionSelector.axisNames.items.items[1].getValue();
                            var changeYLab = functionSelector.axisNames.items.items[2].getValue();
                            //webfit.plot.title=changeTit;
                            webfit.plot.title.text = changeTit;
                            webfit.plot.axes.xaxis.labelOptions.label = changeXLab;
                            webfit.plot.axes.yaxis.labelOptions.label = changeYLab;
                            webfit.ResidualPlot.axes.xaxis.labelOptions.label = changeXLab;
                            webfit.ResidualPlot.axes.yaxis.labelOptions.label = changeYLab;
                            webfit.plot.replot();
                            webfit.ResidualPlot.replot();
                            //can't refresh?
                        }
                    }
                ]
            }
        ]
    });

    var functionSelectionRanges = Ext.create('Ext.panel.Panel', {
        width: 350,
        height: 700,
        //id: 7,
        layout: {type: 'vbox',
            align: 'stretch',
            pack: 'start',
        },
        //renderTo: Ext.getBody(),
        items: [functionSelector.selection, functionSelector.addedFunctions, functionSelector.rangeDomainAxis, ],
    });


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
        columns: [
            {
                header: 'X',
                dataIndex: 'x',
                flex: 1,
                enableKeyEvents: true,
                editor: {
                    allowBlank: false,
                },
                handler: function (grid, rowIndex) {
                    webfit.plot.series[0].data[rowIndex][0] = dataP.store.data.items[rowIndex].data.x;
                    webfit.plot.redraw();
                }
            },
            {
                header: 'Y',
                dataIndex: 'y',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            },
            {
                xtype: 'actioncolumn',
                width: 35,
                dataIndex: 'delete',
                sortable: false,
                align: 'center',
                menuDisabled: true,
                items: [
                    {
                        icon: 'static/lib/ext/welcome/img/delete.png',
                        tooltip: 'Delete Plant',
                        scope: this,
                        handler: function (grid, rowIndex) {
                            var removed = dataPanel.getStore().data.removeAt(rowIndex);

                            dataPanel.getStore().removeAt(rowIndex);
                            console.log('Deleted');
                        },
                    }
                ]
            }
        ],
    });

    dataP.updatePlot = function (store, record, operation, modifiedFieldNames, eOpts) {
        console.log("updating");
        switch (operation) {
            case Ext.data.Model.EDIT:
                console.log('INFO', 'Updating record...');
                var data = dataP.store.data.items;
                for (var row = 0; row < data.length; row++) {
                    if (data[row].data.x === record.data.x && data[row].data.y === record.data.y) {
                        break;
                    }
                }
                webfit.plot.series[0].data[row][0] = (String)(record.data.x);
                webfit.plot.series[0].data[row][1] = (String)(record.data.y);
                //webfit.plot.draw();
                //webfit.plot.redraw();
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
        width: 845, //modify this to return fitResults
        height: 300,
        //renderTo: Ext.getBody(),
        layout: { type: 'fit',
            //align: 'center'
        },
        //layoutConfig: {
        //    columns:1
        //},
        defaults: {
            bodyPadding: 4
        },
        afterComponentLayout: function (width, height) {
            if (webfit.plot === undefined) {
                var sinPoints = [];
                var linPoints = [];

                for (var i = 0; i < 2 * Math.PI; i += 0.4) {
                    var yVal = 2 * Math.sin(i - .8);
                    //var yVal=5.5*i +2.2;
                    sinPoints.push([i, yVal]);
                    dataP.store.add({
                        x: i,
                        y: yVal,
                    });
                }
                /*
                 for (var i=0; i<3; i++) {
                 var yVal=5.7*i +2.2;
                 linPoints.push([i, yVal]);
                 dataP.store.add({
                 x: i,
                 y: yVal,
                 });*/


                webfit.plot = $.jqplot(this.body.id, [sinPoints], {
                    //setTitle: function(newTitle){title: newTitle},
                    title: 'Title',
                    series: [
                        {shadow: false,
                            color: 'red',
                            markerOptions: {shadow: false, size: 4},
                            showLine: false
                        }
                    ],
                    grid: {shadow: false},
                    sortData: false,
                    axes: {
                        xaxis: {
                            min: -1,
                            max: 7,
                            label: 'X Axis',
                            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                            tickOptions: {
                                formatString: "%.2g"
                            }
                        },
                        yaxis: {
                            min: -3,
                            max: 3,
                            label: 'Y Axis',
                            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                            tickOptions: {
                                formatString: "%.2g",
                                // fix for ticks drifting to the left in accordionview!
                                _styles: {right: 0}
                            }
                        }
                    },
                    cursor: {show: true, zoom: false},
                    interactors: [
                        /*{type: 'Line',
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
                            name: 'fcursor',
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


                //$(document).on("updated", updateResiduals);
                //webfit.plot.plugins.interactors.fcursor.on('updated', updateResiduals ,webfit.plotPanel);
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


    var updateResiduals = function () {
        webfit.ResidualPlot.series[0].data = residualUpdate();
        //webfit.ResidualPlot.resetAxesScale();
        webfit.ResidualPlot.replot();
        console.log('UPDATING RESIDUALS');
    };

    var innerPlot = Ext.create('Ext.panel.Panel', {
        width: 450,
        height: 498,
        //id: 10,
        //renderTo: Ext.getBody(),
        layout: {type: 'hbox',
            align: 'stretch',
            pack: 'start',
        },
        items: [webfit.plotPanel, /*plotPanel.fitResults*/],
    });

    var residualUpdate = function () {
        var dataPoints = [];
        var data = webfit.plot.data[0];
        for (var i = 0; i < data.length; i++) {
            var point = data[i];
            var fColPlugin = webfit.plot.plugins.interactors.fcursor;
            var calcy = fColPlugin.sum.call(fColPlugin.FunctionCollection, point[0]);
            //var calcy=webfit.plot.plugins.interactors.fcursor.sum.call($.jqplot.FunctionCollection,point[0]);
            dataPoints.push([point[0], point[1] - calcy]);
        }
        return dataPoints;
    };

    var residuals = Ext.create('Ext.panel.Panel', {
        title: 'Residuals',
        width: 100,
        //id: 11,
        height: 198,
        frame: true,
        layout: { type: 'fit',
            //align: 'center'
        },
        afterComponentLayout: function (width, height) {

            /*var data = [['1/2012', 50],['2/2012', 66],['3/2012', 75]];*/
            $('#' + this.body.id).empty();
            /*var sinPoints = [];
             for (var i=0; i<2*Math.PI; i+=0.4){
             sinPoints.push([i, 2*Math.sin(i-.8)]);
             }*/
            var dataPoints = residualUpdate();

            webfit.ResidualPlot = $.jqplot(this.body.id, [dataPoints], {
                //title: 'Scan space',
                /*series: [ {shadow: false,
                 color: 'red',
                 markerOptions: {shadow: false, size: 4},
                 showLine:false
                 }],*/
                grid: {shadow: false},
                sortData: false,
                axes: {
                    xaxis: {
                        label: 'X',
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {
                            formatString: "%.2g"
                        }
                    },

                    yaxis: {
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
                cursor: {show: true, zoom: false},

            });
        }
    });

    var plot = Ext.create('Ext.panel.Panel', {
        width: 848,
        //id: 12,
        height: 500,
        //renderTo: Ext.getBody(),
        layout: {type: 'vbox',
            align: 'stretch',
            pack: 'start',
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


    var workspace = Ext.create('Ext.tab.Panel', {
        width: 1200,
        //id: 13,
        height: 727,
        renderTo: Ext.getBody(),
        items: [
            {
                title: 'Workspace',
                layout: {type: 'hbox',
                    align: 'stretch',
                    pack: 'start',
                },
                items: [functionSelectionRanges, plot],
            },
            {
                title: 'Data',
                items: [dataPanel],
            },
            {
                title: 'Help Manual',
            }
        ],

        afterComponentLayout: function (width, height) {
//	    webfit.plot.plugins.interactors.fcursor.onDrag = new function(pos){
//		webfit.plot.plugins.interactors.fcursor.onDrag(pos);
//		webfit.ResidualPlot.series[0].data = residualUpdate();
//		webfit.ResidualPlot.redraw();

            if (typeof window.myApp === 'undefined') {
                window.myApp = {};
            }
            ;
//}
            $(myApp).on('function_collection_update', function (e) {
                console.log('function collection updated');
                updateResiduals();
            });
        }




    });

});