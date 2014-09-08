Ext.Loader.setConfig({
    enabled: true
});

Ext.Loader.setPath('Ext.ux', 'static/lib/ext/examples/ux');
Ext.Loader.setPath('Ext.selection', 'static/lib/ext/src/selection');
Ext.Loader.setPath('Ext.grid', 'static/lib/ext/src/grid');

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
], function() {
    /*
        // Add csrf token to every ajax request
        var token = Ext.util.Cookies.get('csrftoken');
        if (!token) {
            Ext.Error.raise("Missing csrftoken cookie");
        } else {
            Ext.Ajax.defaultHeaders = Ext.apply(Ext.Ajax.defaultHeaders || {}, {
                'X-CSRFToken': token
            });
        }*/
});
    var params = [];
Ext.onReady(function() {

    Ext.namespace("webfit");
    Ext.namespace("functionSelector");
    //Ext.namespace("rangeLimiter");
    Ext.namespace("plotPanel");
    Ext.namespace("residualPanel");
    Ext.namespace("toolbarFunctions");
    Ext.namespace('dataP');
    Ext.namespace('fitP');

    webfit.updatePlotData = function(files) {
        var reader = new FileReader();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            //if(!file.type.match('csv.*')){
            //	alert('Can only load csv files');
            //	continue;
            //  }
            reader.readAsText(file);
            reader.onload = function(event) {
                var inData = event.target.result;
                var webfitData = webfit.plot.series[0].data;
                var residualData = webfit.ResidualPlot.series[0].data;

                //CLEAR PREVIOUS DATA
                while (webfitData.length !== 0) {
                    webfitData.pop();
                    residualData.pop();
                    webfit.plot.data[0].pop();
                    console.log(webfitData.length);
                }
                if (dataP.store.data.items.length !== 0) {
                    dataP.store.removeAll();
                }

                var a = file.name.split("."); //ICP reader
                var data = [];
                if (a[a.length - 1] == "bt4") {
                    ICP = new ICPParser();
                    ICP.read(inData);
                    var name = "";
                    var maxRange = -9999;
                    for (var d = 0; d < ICP.columnnames.length; d++) {
                        if (ICP.columnnames[d] != "counts" && ICP.columnnames[d] != "points") {
                            if (maxRange < scaledRange(ICP.column[ICP.columnnames[d]])) {
                                name = ICP.columnnames[d];
                                maxRange = scaledRange(ICP.column[ICP.columnnames[d]]);
                            }
                        }
                    }
                    if (maxRange == -9999) {
                        name = "points";
                    }
                    for (var z = 0; z < ICP.column["counts"].length; z++) {
                        data.push([ICP.column[name][z], ICP.column["counts"][z], Math.sqrt(ICP.column["counts"][z])]);
                    }

                } else {
                    //webfit.plot.redraw();
                    data = $.csv.toArrays(inData);
                }
                //var html = '';
                var xMin = 9999,
                    xMax = -9999,
                    yMin = 9999,
                    yMax = -9999;
                for (var row in data) {
                    xMin = Math.min(xMin, parseFloat(data[row][0]));
                    xMax = Math.max(xMax, parseFloat(data[row][0]));
                    yMin = Math.min(yMin, parseFloat(data[row][1]));
                    yMax = Math.max(yMax, parseFloat(data[row][1]));
                    if (typeof data[row][2] == 'undefined') {
                        webfitData.push([parseFloat(data[row][0]), parseFloat(data[row][1]), {
                            yerr: Math.sqrt(parseFloat(data[row][1])),
                            yupper: parseFloat(data[row][1]) + Math.sqrt(parseFloat(data[row][1])),
                            ylower: parseFloat(data[row][1]) - Math.sqrt(parseFloat(data[row][1])),
                            xerr: 0
                        }]);
                        residualData.push([parseFloat(data[row][0]), parseFloat(data[row][1]), {
                            yerr: Math.sqrt(parseFloat(data[row][1])),
                            yupper: parseFloat(data[row][1]) + Math.sqrt(parseFloat(data[row][1])),
                            ylower: parseFloat(data[row][1]) - Math.sqrt(parseFloat(data[row][1])),
                            xerr: 0
                        }]);
                        webfit.plot.data[0].push([parseFloat(data[row][0]), parseFloat(data[row][1]), {
                            yerr: Math.sqrt(parseFloat(data[row][1])),
                            yupper: parseFloat(data[row][1]) + Math.sqrt(parseFloat(data[row][1])),
                            ylower: parseFloat(data[row][1]) - Math.sqrt(parseFloat(data[row][1])),
                            xerr: 0
                        }]);
                        dataP.store.add({
                            x: parseFloat(parseFloat(data[row][0])),
                            y: parseFloat(parseFloat(data[row][1])),
                            yerr: Math.sqrt(parseFloat(data[row][1])),
                            yupper: parseFloat(data[row][1]) + Math.sqrt(parseFloat(data[row][1])),
                            ylower: parseFloat(data[row][1]) - Math.sqrt(parseFloat(data[row][1])),
                            xerr: 0
                        });
                    } else {
                        webfitData.push([parseFloat(data[row][0]), parseFloat(data[row][1]), {
                            yerr: parseFloat(data[row][2]),
                            xerr: 0,
                            yupper: parseFloat(data[row][1]) + parseFloat(data[row][2]),
                            ylower: parseFloat(data[row][1]) - parseFloat(data[row][2]),
                        }]);
                        residualData.push([parseFloat(data[row][0]), parseFloat(data[row][1]), {
                            xerr: 0,
                            yerr: parseFloat(data[row][2]),
                            yupper: parseFloat(data[row][1]) + parseFloat(data[row][2]),
                            ylower: parseFloat(data[row][1]) - parseFloat(data[row][2]),
                        }]);
                        webfit.plot.data[0].push([parseFloat(data[row][0]), parseFloat(data[row][1]), {
                            xerr: 0,
                            yerr: parseFloat(data[row][2]),
                            yupper: parseFloat(data[row][1]) + parseFloat(data[row][2]),
                            ylower: parseFloat(data[row][1]) - parseFloat(data[row][2]),
                        }]);
                        dataP.store.add({
                            x: parseFloat(data[row][0]),
                            y: parseFloat(data[row][1]),
                            xerr: 0,
                            yerr: parseFloat(data[row][2]),
                            yupper: parseFloat(data[row][1]) + parseFloat(data[row][2]),
                            ylower: parseFloat(data[row][1]) - parseFloat(data[row][2]),

                        });
                    }
                    //  var item={x: data[row][0],
                    //	y: data[row][1],};
                    //dataP.store.add(Ext.create('dataModel', item);
                    //html += '<tr>\r\n';
                    //for(var item in data[row]) {
                    //html += '<td>' + data[row][item] + '</td>\r\n';
                    //}
                    //html += '</tr>\r\n';
                }
                webfit.plot.axes.xaxis.min = xMin;
                webfit.plot.axes.xaxis.max = xMax;
                webfit.plot.axes.yaxis.min = yMin;
                webfit.plot.axes.yaxis.max = yMax;
                webfit.ResidualPlot.axes.xaxis.min = xMin;
                webfit.ResidualPlot.axes.xaxis.max = xMax;
                webfit.ResidualPlot.axes.yaxis.min = yMin;
                webfit.ResidualPlot.axes.yaxis.max = yMax;
                webfit.plot.replot();
                webfit.ResidualPlot.replot();



                dataPanel.getView().refresh();
                //$('#contents').html(html);
                webfit.plot.redraw();
                webfit.ResidualPlot.replot();
                console.log("UPDATING PLOTS");
            };
            reader.onerror = function() {
                alert('Unable to read ' + file.fileName);
            };
        }
        console.log('imported');
    };

    Ext.define('Ext.ux.upload.BrowseButton', {
        extend: 'Ext.form.field.File',

        buttonOnly: true,
        //renderTo: Ext.getBody(),
        iconCls: 'ux-mu-icon-action-browse',
        buttonText: 'Import Data',

        initComponent: function() {

            this.addEvents({
                'fileselected': true
            });

            Ext.apply(this, {
                buttonConfig: {
                    iconCls: this.iconCls,
                    text: this.buttonText
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
        createFileInput: function() {
            this.callParent(arguments);
            this.fileInputEl.dom.setAttribute('multiple', '1');
        },

    });
    var scaledRange = function(x) {
        var min = 9999;
        var max = -9999;
        for (var a = 0; a < x; a++) {
            min = Math.min(x[a], min);
            max = Math.max(x[a], max);
        }
        return (max - min) * max;
    };

    //THE START OF REDISPLAYING
    var toolbar = Ext.create('Ext.toolbar.Toolbar', {
        renderTo: Ext.getBody(),
        //id: 1,
        width: 1200,
        items: [{
                xtype: 'splitbutton',
                text: 'File',
                menu: new Ext.menu.Menu({
                    items: [Ext.create('Ext.ux.upload.BrowseButton', {}), {
                            text: 'Export Graph',
                            handler: function() {}
                        },
                        //{text: 'Save', handler: function(){  }},
                        //{text: 'Save As', handler: function(){  }},
                    ]
                })
            }, {
                xtype: 'tbspacer',
                width: 45
            },
            /*{
                        xtype: 'splitbutton',
                        text: 'Edit',
                        menu: new Ext.menu.Menu({
                            items: [{
                                text: 'Undo',
                                handler: function() {}
                            }, {
                                text: 'Redo',
                                handler: function() {}
                            }, ]
                        })
                    }, {
                        xtype: 'tbspacer',
                        width: 45
                    }, {
                        xtype: 'splitbutton',
                        text: 'View',
                        menu: new Ext.menu.Menu({
                            items: [{
                                    text: 'Show',
                                    handler: function() {},
                                    menu: new Ext.menu.Menu({
                                        items: [{
                                            xtype: 'menucheckitem',
                                            text: 'Fit Results',
                                            checked: true,
                                        }, {
                                            xtype: 'menucheckitem',
                                            text: 'Residuals',
                                            checked: true,
                                        }, {
                                            xtype: 'menucheckitem',
                                            text: 'Limits',
                                            checked: true,
                                        }, ]
                                    })
                                }, //show list
                            ]
                        })
                    }, {
                        xtype: 'tbspacer',
                        width: 45
                    },*/
            {
                xtype: 'splitbutton',
                text: 'Fit Controls',
                menu: new Ext.menu.Menu({
                    items: [{
                            text: 'Specifications',
                            handler: function() {
                                functionSelector.specs.setVisible(true);
                            }
                        },
                        //{text: 'Remove Function Options', handler: function(){  }},
                    ]
                })
            }, {
                xtype: 'tbspacer',
                width: 45
            },
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
            data: [{
                "name": "Gaussian"
            }, {
                "name": "Line"
            }, {
                "name": "New Function"
            }, ]
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

    var addInteractor = function(functionType) {

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
        webfit.plot.options.interactors.push(tcursor); //remove


        var name = tcursor.name;
        var newi = new $.jqplot.InteractorPluginSubtypes[tcursor.type]();
        webfit.plot.plugins.interactors[name] = newi;
        newi.init(tcursor);
        newi.plot = webfit.plot;
        //for (var j in newi.grobs) {
        //    this.plugins._interactor.grobs.push(newi.grobs[j]);
        //}
        webfit.plot.plugins._interactor.interactors.push(newi); //remove
        webfit.plot.plugins.interactors.fcursor.register(newi); //unregister first
        webfit.plot.redraw();

        //UPDATE RESIDUALS
        webfit.ResidualPlot.series[0].data = residualUpdate();
        webfit.ResidualPlot.replot();
        //       console.log('UPDATED RESIDUALS');

        return tcursor.name;
    }

    functionSelector.params = function(functionName) {
		var singleParams=[];
		for(var a=0; a<params.length; a++) {
			singleParams.push({name:params[a].header,
								type: 'boolean'});
		}
		var functionParams=[];
		functionParams.push({
					'name': functionName+"a",   
'fixed': false,
                'val': '',
                'bounded': false,
                'up': '',
                'low': '',
                'tied': false,
                'relationship': ''					
                    });
        functionParams.push({
                    'name': functionName+"b",    
                    });
		if(webfit.plot.plugins._interactor.interactors[webfit.plot.plugins._interactor.interactors.length-1].type=="Gaussian") {
			functionParams.push({
                    'name': functionName+"c",    
                    });
		}
        var store = Ext.create('Ext.data.Store', {
            fields: singleParams,
            data: functionParams,
        });
        return store;
    }

    Layout = function(functionName) {
		var allCols=[];
		allCols.push({
                            //header: '',
                            dataIndex: 'name',
                            width: 70,
                            editable: false,
                            /*editor: {
                                allowBlank: false
                                }*/
                        });
		allCols.push({
                            xtype: 'checkcolumn',
                            header: 'Fixed',
                            dataIndex: 'fixed',
                            width: 40,
                            stopSelection: false,
                        });
		for(var a = 0; a< params.length; a++) {
			allCols.push(params[a]);
		}
        var panel = Ext.create('Ext.panel.Panel', {
            height: 101,
            width: 480,
            border: false,
            //autoScroll: true,
            bodyBorder: false,
            hideBorders: true,
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start',
            },
            items: [
                /*{
                    xtype: 'label',
                    //forId: 'myFieldId',
                    text: functionName,
                    //margins: '0 0 0 10'
                    },*/
                {
                    xtype: 'gridpanel',
                    layout: {
                        type: 'hbox',
                        align: 'stretch',
                        pack: 'start',
                    },
                    plugins: [new Ext.grid.plugin.CellEditing({
                        clicksToEdit: 1
                    })],
                    //autoScroll: true,
                    store: functionSelector.params(functionName),
                    columns: allCols
                    ,
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
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start',
        },
        buttons: [{
            text: 'Apply'
        }],
    });

    functionSelector.add = Ext.create('Ext.Button', {
        text: 'Add',
        //id: 4,
        //renderTo: Ext.getBody(),
        handler: function() {
            if (functionSelector.chooser.getValue() === null) {
                alert('You must choose a function before adding.');
            } else {
                var selection = functionSelector.chooser.getValue();
                if (selection === "New Function") {
                    functionSelector.newFunction.setVisible(true);
                } else {
                    var theName = addInteractor(selection);
                    functionSelector.addStore.add({
                        name: theName,
                        type: selection,
                        color1: 'green',
                        color2: 'blue',
                        show: true,
                    });
                }
                    params.push({
                        xtype: 'checkcolumn',
                        header: webfit.plot.plugins._interactor.interactors[webfit.plot.plugins._interactor.interactors.length-1].name + "a",
                        dataIndex: 'fixed',
                        width: 60,
                        stopSelection: false,
                    });
                    params.push({
                        xtype: 'checkcolumn',
                        header: webfit.plot.plugins._interactor.interactors[webfit.plot.plugins._interactor.interactors.length-1].name + "b",
                        dataIndex: 'fixed',
                        width: 60,
                        stopSelection: false,
                    });
                    if (webfit.plot.plugins._interactor.interactors[webfit.plot.plugins._interactor.interactors.length-1].type == "Gaussian") {
                        params.push({
                            xtype: 'checkcolumn',
                            header: webfit.plot.plugins._interactor.interactors[webfit.plot.plugins._interactor.interactors.length-1].name + "c",
                            dataIndex: 'fixed',
                            width: 60,
                            stopSelection: false,
                        });
                    }
				functionSelector.specs.items.removeAll();
                functionSelector.specs.items.add(Layout(theName));
            }
        },
        x: 292,
        y: 8,
    });
    var fitMin = -9999;
    var fitMax = 9999;
    var map;
    var xDat, yDat, err;
    functionSelector.fit1 = Ext.create('Ext.Button', {
        text: 'Simplex Fit',
        //id: 4,
        //renderTo: Ext.getBody(),
        handler: function() {
            map = [];
            xDat = [];
            yDat = [];
            err = [];
            if (fitP.store.data.items.length !== 0) {
                fitP.store.removeAll();
            }
            var name = "cursor"
            var counter = 0;
            //functionSelector.currentlyFitting.setVisible(true);
            this.x0 = [];
            var x1, y1, x2, y2;
            var linF = function(p, x) {
                return p[0] * x + p[1];
            };
            var gauF = function(p, x) {
                return p[0] * Math.exp(-Math.pow((x - p[1]), 2) / (2 * Math.pow(p[2], 2)));
            };
            while (typeof webfit.plot.plugins.interactors[name + counter] != 'undefined') {
                x1 = webfit.plot.plugins.interactors[name + counter].grobs[0].coords.x;
                y1 = webfit.plot.plugins.interactors[name + counter].grobs[0].coords.y;
                x2 = webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x;
                y2 = webfit.plot.plugins.interactors[name + counter].grobs[1].coords.y;
                if (webfit.plot.plugins.interactors[name + counter].type == "Line") {

                    map.push({
                        type: "Line",
                        params: 2,
                        func: linF,
                        p: [1, 2]
                    });
                    this.x0.push((y2 - y1) / (x2 - x1));
                    this.x0.push((y2 * x1 - y1 * x2) / (x1 - x2));
                } else if (webfit.plot.plugins.interactors[name + counter].type == "Gaussian") {
                    map.push({
                        type: "Gaussian",
                        params: 3,
                        func: gauF,
                        p: [1, 2, 3]
                    });
                    this.x0.push(y1);
                    this.x0.push(x1);
                    this.x0.push(x2 / (4.29193));
                }
                counter++;
            }

            //var a = webfit.plot.plugins.interactors.fcursor.FunctionCollection.g;

            if (functionSelector.plotFitDomain.items.getAt(1).getValue() != functionSelector.plotFitDomain.items.getAt(2).getValue()) {
                fitMin = functionSelector.plotFitDomain.items.getAt(1).getValue();
                fitMax = functionSelector.plotFitDomain.items.getAt(2).getValue();
            }
            for (i = 0; i < webfit.plot.data[0].length; i++) {
                if (webfit.plot.data[0][i][0] > fitMin && webfit.plot.data[0][i][0] < fitMax) {
                    xDat.push(webfit.plot.data[0][i][0]);
                    yDat.push(webfit.plot.data[0][i][1]);
                    err.push(webfit.plot.data[0][i][2].yupper - webfit.plot.data[0][i][1]);
                }
            }
            var sqResid = function(x) {
                //a = webfit.plot.plugins.interactors.fcursor.FunctionCollection.g
                var count = 0;
                for (var i = 0; i < map.length; i++) {
                    map[i].p = [];
                    for (var j = 0; j < map[i].params; j++) {
                        map[i].p.push(x[count]);
                        count++;
                    }
                }
                var z = function(x) {
                    var c = 0;
                    for (var i = 0; i < map.length; i++) {
                        c += map[i].func(map[i].p, x);
                    }
                    return c;
                }
                var sqRes = 0;
                for (i = 0; i < webfit.plot.data[0].length; i++) {
                    if (xDat[i] > fitMin && xDat[i] < fitMax) {
                        sqRes += Math.pow(z(xDat[i]) - yDat[i], 2); //fix this
                    }
                }
                return sqRes;


            };

            var x = SimplexEq.simplex(sqResid, this.x0);
            console.log(x);
            residualUpdate();

            var counter = 0;
            var iter = 0;
            var retStr = "";

            while (typeof webfit.plot.plugins.interactors[name + counter] != 'undefined') {
                if (webfit.plot.plugins.interactors[name + counter].type == "Line") {
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.x = 0;
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.y = map[counter].func(map[counter].p, 0);
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x = 1;
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.y = map[counter].func(map[counter].p, 1);
                    fitP.store.add({
                        func: name + counter,
                        a: map[counter].p[0],
                        aerr: 0,
                        b: map[counter].p[1],
                        berr: 0,
                        c: 0,
                        cerr: 0,

                    });
                    retStr += "line" + counter + ": a = " + Math.round(map[counter].p[0] * 1000) / 1000 + '\t' + "b = " + Math.round(map[counter].p[1] * 1000) / 1000 + '</br>';
                    iter += 2;

                } else if (webfit.plot.plugins.interactors[name + counter].type == "Gaussian") {
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.x = map[counter].p[1];
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.y = map[counter].p[0];
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x = map[counter].p[2] * 12.5 / 3.5 + map[counter].p[1];
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.y = map[counter].func(map[counter].p, webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x);
                    fitP.store.add({
                        func: name + counter,
                        a: map[counter].p[0],
                        aerr: 0,
                        b: map[counter].p[1],
                        berr: 0,
                        c: map[counter].p[2],
                        cerr: 0,

                    });
                    retStr += "gaus" + counter + ": a = " + Math.round(map[counter].p[0] * 1000) / 1000 + '\t' + "b = " + Math.round(map[counter].p[1] * 1000) / 1000 + '\t' + "c = " + Math.round(map[counter].p[2] * 1000) / 1000 + '</br>';
                    iter += 3;
                }


                counter++;
            }
            var z = function(x) {
                var c = 0;
                for (var i = 0; i < map.length; i++) {
                    c += map[i].func(map[i].p, x);
                }
                return c;
            }
            var sqRes = 0;
            for (i = 0; i < webfit.plot.data[0].length; i++) {
                if (xDat[i] > fitMin && xDat[i] < fitMax) {
                    sqRes += Math.pow((z(xDat[i]) - yDat[i]) / err[i], 2); //fix this
                }
            }
            functionSelector.fitResults.items.items[0].update(retStr + 'Chisq: ' + sqRes);
            webfit.plot.replot();
            webfit.ResidualPlot.replot();
            //fit the function

        },
        x: 40,
        y: 38,
    });
    functionSelector.fit3 = Ext.create('Ext.Button', {
        text: 'L-M Fast Fit',
        //id: 4,
        //renderTo: Ext.getBody(),
        handler: function() {
            map = [];
            xDat = [];
            yDat = [];
            err = [];
            if (fitP.store.data.items.length !== 0) {
                fitP.store.removeAll();
            }
            this.p = [];
            var fitMin = -9999;
            var fitMax = 9999;
            //this.map=[];
            var name = "cursor";
            var counter = 0;
            var pcount = 1;
            if (functionSelector.plotFitDomain.items.getAt(1).getValue() != functionSelector.plotFitDomain.items.getAt(2).getValue()) {
                fitMin = functionSelector.plotFitDomain.items.getAt(1).getValue();
                fitMax = functionSelector.plotFitDomain.items.getAt(2).getValue();
                console.log(fitMin + " " + fitMax);
            }
            var xDat = [],
                yDat = [],
                err = [];
            for (i = 0; i < webfit.plot.data[0].length; i++) {
                if (webfit.plot.data[0][i][0] > fitMin && webfit.plot.data[0][i][0] < fitMax) {
                    xDat.push(webfit.plot.data[0][i][0]);
                    yDat.push(webfit.plot.data[0][i][1]);
                    err.push(webfit.plot.data[0][i][2].yupper - webfit.plot.data[0][i][1]);
                }
            }
            var linF = function(p, x) {
                return p[0] * x + p[1];
            };
            var gauF = function(p, x) {
                return p[0] * Math.exp(-Math.pow((x - p[1]), 2) / (2 * Math.pow(p[2], 2)));
            };
            var x1, x2, y1, y2;
            while (typeof webfit.plot.plugins.interactors[name + counter] != 'undefined') {
                x1 = webfit.plot.plugins.interactors[name + counter].grobs[0].coords.x;
                y1 = webfit.plot.plugins.interactors[name + counter].grobs[0].coords.y;
                x2 = webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x;
                y2 = webfit.plot.plugins.interactors[name + counter].grobs[1].coords.y;
                if (webfit.plot.plugins.interactors[name + counter].type == "Line") {

                    map.push({
                        type: "Line",
                        params: 2,
                        func: linF,
                        p: [1, 2]
                    });
                    this.p.push((y2 - y1) / (x2 - x1));
                    this.p.push((y2 * x1 - y1 * x2) / (x1 - x2));
                } else if (webfit.plot.plugins.interactors[name + counter].type == "Gaussian") {
                    map.push({
                        type: "Gaussian",
                        params: 3,
                        func: gauF,
                        p: [1, 2, 3]
                    });
                    this.p.push(y1);
                    this.p.push(x1);
                    this.p.push(x2 / (4.29193));
                }

                counter++;
            }
            var z;
            var sqResid = function(p, fjac, x, y, err) {
                var count = 0;
                for (var i = 0; i < map.length; i++) {
                    map[i].p = [];
                    for (var j = 0; j < map[i].params; j++) {
                        map[i].p.push(p[count]);
                        count++;
                    }
                }
                z = function(x) {
                    var c = 0;
                    for (var i = 0; i < map.length; i++) {
                        c += map[i].func(map[i].p, x);
                    }
                    return c;
                }
                var sqRes = [];
                for (var i = 0; i < xDat.length; i++) {
                    sqRes.push((z(xDat[i]) - yDat[i]) / (err[i])); //fix this   

                }
                var status = 0;

                return {
                    status: status,
                    f: sqRes
                };
            }


            var fa = {};
            fa['x'] = xDat;
            fa['y'] = yDat;
            fa['err'] = err;
            var x = lmfit.lmfit(sqResid, this.p, fa);
            webfit.ResidualPlot.replot();
            counter = 0;
            var iter = 0;
            var retStr = "";

            while (typeof webfit.plot.plugins.interactors[name + counter] != 'undefined') {
                if (webfit.plot.plugins.interactors[name + counter].type == "Line") {
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.x = 0;
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.y = map[counter].func(map[counter].p, 0);
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x = 1;
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.y = map[counter].func(map[counter].p, 1);
                    fitP.store.add({
                        func: name + counter,
                        a: map[counter].p[0],
                        aerr: x.error[0 + iter],
                        b: map[counter].p[1],
                        berr: x.error[1 + iter],
                        c: 0,
                        cerr: 0,

                    });
                    retStr += "line" + counter + ": a = " + Math.round(map[counter].p[0] * 1000) / 1000 + "(" + Math.round(x.error[0 + iter] * 1000) / 1000 + ")" + '\t' + "b = " + Math.round(map[counter].p[1] * 1000) / 1000 + "(" + Math.round(x.error[1 + iter] * 1000) / 1000 + ")" + '</br>';
                    iter += 2;

                } else if (webfit.plot.plugins.interactors[name + counter].type == "Gaussian") {
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.x = map[counter].p[1];
                    webfit.plot.plugins.interactors[name + counter].grobs[0].coords.y = map[counter].p[0];
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x = map[counter].p[2] * 12.5 / 3.5 + map[counter].p[1];
                    webfit.plot.plugins.interactors[name + counter].grobs[1].coords.y = map[counter].func(map[counter].p, webfit.plot.plugins.interactors[name + counter].grobs[1].coords.x);
                    fitP.store.add({
                        func: name + counter,
                        a: map[counter].p[0],
                        aerr: x.error[0 + iter],
                        b: map[counter].p[1],
                        berr: x.error[1 + iter],
                        c: map[counter].p[2],
                        cerr: x.error[2 + iter],

                    });
                    retStr += "gaus" + counter + ": a = " + Math.round(map[counter].p[0] * 1000) / 1000 + "(" + Math.round(x.error[0 + iter] * 1000) / 1000 + ")" + '\t' + "b = " + Math.round(map[counter].p[1] * 1000) / 1000 + "(" + Math.round(x.error[1 + iter] * 1000) / 1000 + ")" + '\t' + "c = " + Math.round(map[counter].p[2] * 1000) / 1000 + "(" + Math.round(x.error[2 + iter] * 1000) / 1000 + ")" + '</br>';
                    iter += 3;
                }


                counter++;
            }
            functionSelector.fitResults.items.items[0].update(retStr + 'Chisq: ' + x.chisq / x.dof);
            webfit.plot.replot();
            webfit.ResidualPlot.replot();

            //            console.log('UPDATING RESIDUALS');
            //fit the function
        },
        x: 100,
        y: 38,
    });


    functionSelector.selection = Ext.create('Ext.panel.Panel', {
        width: 496,
        height: 100,
        //id: 5,
        //height: 200,
        autoScroll: true,
        //bodyPadding: 50,
        //items: [functionSelector.chooser, functionSelector.add, functionSelector.fit1,  functionSelector.fit3,functionSelector.fit2],
        items: [functionSelector.chooser, functionSelector.add, functionSelector.fit1, functionSelector.fit3],
    });

    functionSelector.addStore = Ext.create('Ext.data.Store', {
        fields: [{
            name: 'name',
            type: 'string'
        }, {
            name: 'type',
            type: 'string'
        }, {
            name: 'color1',
            type: 'string'
        }, {
            name: 'color2',
            type: 'string'
        }, {
            name: 'show',
            type: 'boolean'
        }, ],
    });

    functionSelector.newFunction = Ext.create('Ext.window.Window', {
        title: 'Add a New Function',
        width: 500,
        height: 300,
        closeAction: 'hide',
        items: [{
            xtype: 'textfield',
            name: 'newfunc',
            width: 480,
            height: 230,
            //padding: '0 0 0 20',
            labelAlign: 'top',
            fieldLabel: 'Type in javascript:',
            autoScroll: true,

            //allowBlank: false,
        }],
        buttons: [{
            text: 'Add',
            handler: function() {

            },
        }],
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
                    data: [{
                        'color': "blue"
                    }, {
                        'color': "green"
                    }, {
                        'color': "red"
                    }, ]
                }),
                displayField: 'color',
                autoScroll: true,
                editable: false,
                queryMode: 'local',
                allowBlank: false,
                listeners: {
                    click: {
                        element: 'el', //bind to the underlying el property on the panel
                        fn: function() {
                            console.log('click el');
                        }
                    },
                },
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
                    data: [{
                        'color': "blue"
                    }, {
                        'color': "green"
                    }, {
                        'color': "red"
                    }, ]
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
                handler: function(grid, rowIndex) {
                    console.log(grid);
                    //                   console.log(rowIndex);
                    var removed = functionSelector.addedFunctions.getStore().data.removeAt(rowIndex);
                    functionSelector.addedFunctions.getStore().sync();
                    var removedInteractor = webfit.plot.plugins.interactors.fcursor.unregister(removed.data.name);

                    var indexPlugins = webfit.plot.plugins._interactor.interactors.indexOf(removedInteractor)
                    if (indexPlugins === webfit.plot.plugins._interactor.interactors.length - 1) {
                        webfit.plot.plugins._interactor.interactors.pop();
                    } else if (indexPlugins !== -1) {
                        for (var i = indexPlugins; i < webfit.plot.plugins._interactor.interactors.length - 1; i++) {
                            webfit.plot.plugins._interactor.interactors[i] = webfit.plot.plugins._interactor.interactors[i + 1];
                        }
                        webfit.plot.plugins._interactor.interactors.pop();
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
                    functionSelector.addedFunctions.getStore().sync();
                    for (var i = 0; i < webfit.plot.options.interactors.length; i++) {
                        //                        console.log(webfit.plot.options.interactors[i].name);
                        if (webfit.plot.options.interactors[i].name === removed.data.name) {
                            indexOptions = i;
                        }
                    }
                    if (indexOptions === webfit.plot.options.interactors.length - 1) {
                        //                       console.log('last complete');
                        webfit.plot.options.interactors.pop();
                    } else if (indexOptions !== -1) {
                        for (var i = indexOptions; i < webfit.plot.options.interactors.length - 1; i++) {
                            webfit.plot.options.interactors[i] = webfit.plot.options.interactors[i + 1];
                        }
                        webfit.plot.options.interactors.pop();
                    }
                    //                    console.log('Deleted');
                    if (typeof webfit.plot.plugins._interactor.grobs[0].parent.interactors[webfit.plot.plugins._interactor.grobs[0].parent.interactors.length - 1] == 'undefined') {
                        webfit.plot.plugins._interactor.grobs[0].parent.interactors.pop();
                    }
                    webfit.plot.redraw();
                },
            }]
        }],
        tbar: [
            /*{
                text: 'Specifications',
                scope: this,
                handler: function(){
                functionSelector.specs.setVisible(true);
                },
                },*/
            {
                text: 'Fit',
                width: 70,
                scope: this,
                handler: function() {
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
        layout: {
            type: 'hbox',
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
            allowBlank: false // requires a non-empty value
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
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'center',
        },
        border: false,
        //padding: '15 0 0 0',
        bodyBorder: false,
        hideBorders: true,
        items: [{
            xtype: 'textfield',
            name: 'title',
            width: 110,
            labelPad: -30,
            labelAlign: 'left',
            fieldLabel: 'Title',
            allowBlank: false // requires a non-empty value
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

    functionSelector.plotFitDomain = Ext.create('Ext.panel.Panel', {
        height: 45,
        layout: {
            type: 'hbox',
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
            allowBlank: false // requires a non-empty value
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
    functionSelector.fitResults = Ext.create('Ext.panel.Panel', {
        height: 90,
        width: 400,
        bodyPadding: 10,
        layout: {
            type: 'hbox',
            align: 'stretch',
            pack: 'start',
        },
        border: false,
        bodyBorder: false,
        hideBorders: true,
        items: [{
            xtype: 'label',
            name: 'chisq',

            text: 'Chi-sq: ',
            margins: '0 0 0 0'
        }]
    });
    //document.write("\[ \left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right) \]");
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
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'center',
                },
                items: [functionSelector.plotFitDomain, ],
                //buttons: [
                //{
                //text: 'Update',
                //handler: function () {
                ////                            plotymin = Math.floor(functionSelector.plotFitDomain.items.getAt(1).getValue());
                ////                            plotymax = Math.floor(functionSelector.plotFitDomain.items.getAt(2).getValue());
                ////                            console.log('min', plotymin);
                ////                            console.log('max', plotymax);
                ////
                ////                            webfit.plot.axes.yaxis.min = plotymin;
                ////                            webfit.plot.axes.yaxis.max = plotymax;
                ////                            webfit.ResidualPlot.axes.yaxis.min = plotymin;
                ////                            webfit.ResidualPlot.axes.yaxis.max = plotymax;
                ////                            webfit.plot.replot();
                ////                            webfit.ResidualPlot.replot();
                ////alert('You clicked the button!')
                //}
                //}
                //]
            }, {
                title: 'Axis Names',
                //bodyPadding: 20,
                padding: '0 50 0 50',
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'center',
                },
                items: [functionSelector.axisNames],
                //KEYS:["textfield-1081", "textfield-1082", "textfield-1083"]
                buttons: [{
                    text: 'Update',
                    handler: function() {
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
                }]
            }, {
                title: 'Fit Results',
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'center',
                },
                items: [functionSelector.fitResults, ],
                //buttons: [
                //{
                //text: 'Update',
                //handler: function () {
                ////                            plotymin = Math.floor(functionSelector.plotFitDomain.items.getAt(1).getValue());
                ////                            plotymax = Math.floor(functionSelector.plotFitDomain.items.getAt(2).getValue());
                ////                            console.log('min', plotymin);
                ////                            console.log('max', plotymax);
                ////
                ////                            webfit.plot.axes.yaxis.min = plotymin;
                ////                            webfit.plot.axes.yaxis.max = plotymax;
                ////                            webfit.ResidualPlot.axes.yaxis.min = plotymin;
                ////                            webfit.ResidualPlot.axes.yaxis.max = plotymax;
                ////                            webfit.plot.replot();
                ////                            webfit.ResidualPlot.replot();
                ////alert('You clicked the button!')
                //}
                //}
                //]
            },
        ]
    });

    var functionSelectionRanges = Ext.create('Ext.panel.Panel', {
        width: 350,
        height: 700,
        //id: 7,
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start',
        },
        //renderTo: Ext.getBody(),
        items: [functionSelector.selection, functionSelector.addedFunctions, functionSelector.rangeDomainAxis, ],
    });


    dataP.store = Ext.create('Ext.data.Store', {
        fields: [{
                name: 'x',
                type: 'number'
            }, {
                name: 'y',
                type: 'number'
            }, {
                name: 'xerr',
                type: 'number'
            }, {
                name: 'yerr',
                type: 'number'
            },

        ],
    });
    fitP.store = Ext.create('Ext.data.Store', {
        fields: [{
            name: 'func'
        }, {
            name: 'a',
            type: 'number'
        }, {
            name: 'aerr',
            type: 'number'
        }, {
            name: 'b',
            type: 'number'
        }, {
            name: 'berr',
            type: 'number'
        }, {
            name: 'c',
            type: 'number'
        }, {
            name: 'cerr',
            type: 'number'
        }, ],
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
                handler: function(grid, rowIndex) {
                    /*webfit.plot.series[0].data[rowIndex][0] = dataP.store.data.items[rowIndex].data.x;
                    webfit.plot.series[0].data[rowIndex][1] = dataP.store.data.items[rowIndex].data.y;
                    webfit.plot.series[0].data[rowIndex][2].yerr=dataP.store.data.items[rowIndex].data.yerr;
                    webfit.plot.redraw();*/
                }
            }, {
                header: 'Y',
                dataIndex: 'y',
                flex: 1,
                editor: {
                    allowBlank: false
                },
                handler: function(grid, rowIndex) {
                    /*webfit.plot.series[0].data[rowIndex][0] = dataP.store.data.items[rowIndex].data.x;
                    webfit.plot.series[0].data[rowIndex][1] = dataP.store.data.items[rowIndex].data.y;
                    webfit.plot.series[0].data[rowIndex][2].yerr=dataP.store.data.items[rowIndex].data.yerr;
                    webfit.plot.redraw();*/
                }
            }, {
                header: 'X-Error',
                dataIndex: 'xerr',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'Y-Error',
                dataIndex: 'yerr',
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
                items: [{
                    icon: 'static/lib/ext/welcome/img/delete.png',
                    tooltip: 'Delete Plant',
                    scope: this,
                    handler: function(grid, rowIndex) {
                        var removed = dataPanel.getStore().data.removeAt(rowIndex);

                        dataPanel.getStore().removeAt(rowIndex);
                        console.log('Deleted');
                    },
                }]
            }
        ],
    });
    var fitPanel = Ext.create('Ext.grid.Panel', {
        //xtype: 'cell-editing',
        //title: 'Added Functions',
        //id: 6,
        //plugins: [new Ext.grid.plugin.CellEditing({
        //clicksToEdit: 1
        //})],
        autoScroll: true,
        store: fitP.store,
        columns: [{
                header: 'Function',
                dataIndex: 'func',
                flex: 1,
                enableKeyEvents: true,
                editor: {
                    allowBlank: false,
                },
                handler: function(grid, rowIndex) {
                    webfit.plot.series[0].data[rowIndex][0] = dataP.store.data.items[rowIndex].data.x;
                    webfit.plot.redraw();
                }
            }, {
                header: 'a',
                dataIndex: 'a',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'a error',
                dataIndex: 'aerr',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'b',
                dataIndex: 'b',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'b error',
                dataIndex: 'berr',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'c',
                dataIndex: 'c',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'c error',
                dataIndex: 'cerr',
                flex: 1,
                editor: {
                    allowBlank: false
                }
            },

        ],
    });

    dataP.updatePlot = function(store, record, operation, modifiedFieldNames, eOpts) {
        //       console.log("updating");
        switch (operation) {
            case Ext.data.Model.EDIT:
                console.log('INFO', 'Updating record...');
                var data = dataP.store.data.items;
                for (var row = 0; row < data.length; row++) {
                    if (data[row].data.x === record.data.x && data[row].data.y === record.data.y) {
                        break;
                    }
                }
                webfit.plot.series[0].data[row][0] = (record.data.x);
                webfit.plot.series[0].data[row][1] = (record.data.y);
                //webfit.plot.series[0].data[row][2].yerr =record.data.yerr;
                webfit.plot.series[0].data[row][2].yupper = record.data.y + record.data.yerr;
                webfit.plot.series[0].data[row][2].ylower = record.data.y - record.data.yerr;

                webfit.plot.data[0][0][0] = record.data.x;
                webfit.plot.data[0][0][1] = (record.data.y);
                //webfit.plot.data[0][0][2].yerr=record.data.yerr;
                webfit.plot.data[0][0][2].yupper = record.data.y + record.data.yerr;
                webfit.plot.data[0][0][2].ylower = record.data.y - record.data.yerr;

                webfit.plot.draw();
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
        layout: {
            type: 'fit',
            //align: 'center'
        },
        //layoutConfig: {
        //    columns:1
        //},
        defaults: {
            bodyPadding: 4
        },
        afterComponentLayout: function(width, height) {
            if (webfit.plot === undefined) {
                var sinPoints = [];
                var linPoints = [];

                for (var i = 0; i < 2 * Math.PI; i += 0.3) {
                    var yVal = 2 * Math.sin(i - .8);
                    //var yVal=5.5*i +2.2;
                    sinPoints.push([i, yVal, {
                        //yerr: Math.sqrt(Math.abs(yVal)),
                        yupper: Math.sqrt(Math.abs(yVal)) + yVal,
                        ylower: -Math.sqrt(Math.abs(yVal)) + yVal,
                        xerr: 0
                    }]);
                    dataP.store.add({
                        x: i,
                        y: yVal,
                        xerr: 0,
                        //yerr: Math.sqrt(Math.abs(yVal)),
                        yupper: Math.sqrt(Math.abs(yVal)) + yVal,
                        ylower: Math.sqrt(Math.abs(yVal)) - yVal,


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
                    series: [{
                        shadow: false,
                        color: 'red',
                        markerOptions: {
                            shadow: false,
                            size: 4
                        },
                        showLine: false
                    }],
                    seriesDefaults: {
                        renderer: $.jqplot.errorbarRenderer,
                        rendererOptions: {
                            errorBar: true
                        },
                    },
                    grid: {
                        shadow: false
                    },
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
                                _styles: {
                                    right: 0
                                }
                            }
                        }
                    },
                    cursor: {
                        show: true,
                        zoom: false
                    },
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
                        {
                            type: 'FunctionCollection',
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


    var updateResiduals = function() {
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
        layout: {
            type: 'hbox',
            align: 'stretch',
            pack: 'start',
        },
        items: [webfit.plotPanel, /*plotPanel.fitResults*/ ],
    });

    var residualUpdate = function() {
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
        layout: {
            type: 'fit',
            //align: 'center'
        },
        afterComponentLayout: function(width, height) {

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
                grid: {
                    shadow: false
                },
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
                            _styles: {
                                right: 0
                            }
                        }
                    }
                },
                cursor: {
                    show: true,
                    zoom: false
                },

            });
        }
    });

    var plot = Ext.create('Ext.panel.Panel', {
        width: 848,
        //id: 12,
        height: 500,
        //renderTo: Ext.getBody(),
        layout: {
            type: 'vbox',
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

        layout: 'fit',
        renderTo: Ext.getBody(),
        items: [{
            title: 'Workspace',
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start',
            },
            items: [functionSelectionRanges, plot],
        }, {
            title: 'Data',
            items: [dataPanel],
        }, {
            autoScroll: true,
            title: 'Help Manual',
            id: 'helpmanualtab',
            //iconCls: '/static/img/silk/help.png',
            html: '<font face="Verdana"><font size="5"><h1>WebFit - Sponsored by the NCNR</h1> Map of Features: <br><img src="img/Step1.png" border="0"><br><img src="img/Step2.png" border="0"><br><img src="img/Step3.png" border="0"><br><img src="img/Step4.png" border="0"><br><img src="img/Step5.png" border="0"><br><img src="img/Step6.png" border="0"><br>'
        }, {
            title: 'Fit Results',
            items: [fitPanel],
        }],

        afterComponentLayout: function(width, height) {
            //	    webfit.plot.plugins.interactors.fcursor.onDrag = new function(pos){
            //		webfit.plot.plugins.interactors.fcursor.onDrag(pos);
            //		webfit.ResidualPlot.series[0].data = residualUpdate();
            //		webfit.ResidualPlot.redraw();

            if (typeof window.myApp === 'undefined') {
                window.myApp = {};
            };
            //}
            $(myApp).on('function_collection_update', function(e) {
                console.log('function collection updated');
                updateResiduals();
            });
        }




    });

});