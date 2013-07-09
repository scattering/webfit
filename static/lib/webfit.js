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
    /* 

     */



    Ext.namespace("webfit");






    // ********* START - Setting up lattice constants GUI  *********



    /*Ext.define('a3range', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'a3start', type: 'float' },
            { name: 'a3step', type: 'float' },
            { name: 'a3end', type: 'float' }
        ]
    });


    Ext.define('a4range', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'a4start', type: 'float' },
            { name: 'a4step', type: 'float' },
            { name: 'a4end', type: 'float' }
        ]
    });

    var a3default = Ext.create('a3range', {
        a3start : 0.0,
        a3step  : 5.0,
        a3end: 0.1
    });*/




   // var store = Ext.create('Ext.data.Store', { model:'deviceModel', data: myData});
   
   
   
   

/*    webfit.a3FieldSet = {
        itemId      : 'a3FieldSet',
        xtype       : 'fieldset',
        border      : false,
        defaultType : 'numberfield',
        layout: { type: 'column',
                  pack: 'start',
                  align: 'stretch'
        },
        defaults    : {allowBlank : false,
            decimalPrecision: 10,
            labelPad:'-2',
            labelWidth:'10',
            labelAlign:'top',
            columnWidth: 0.3,
            //anchor: '100%',
            hideTrigger: true,
            style: {'margin': '0px 5px 5px 0px',
                'border':0,
                'paddingRight':15
            },
            flex:1
        },
        items: [{fieldLabel: 'a3start',
            name: 'a3start'
        },
            {fieldLabel: 'a3step',
                name: 'a3step'
            },
            {fieldLabel: 'a3end',
                name: 'a3end'
            }
        ]
    };

    webfit.a4FieldSet = {
        xtype       : 'fieldset',
        border      : false,
        itemId      : 'a4FieldSet',
        defaultType : 'numberfield',
        layout: { type: 'column',
                  pack: 'start',
                  align: 'stretch'
        },
        defaults    : {allowBlank : false,
            decimalPrecision: 10,
            labelPad:'-2',
            labelWidth:'10',
            labelAlign:'top',
            columnWidth: 0.3,
            //anchor: '100%',
            hideTrigger: true,
            //style: {'margin': '0px 5px 5px 0px',
            //    'border':0,
            //    'paddingRight':15
            //},
            flex:1
        },
        items: [{fieldLabel: 'a4start',
            name: 'a4start'
        },
            {fieldLabel: 'a4step',
                name: 'a4step'
            },
            {fieldLabel: 'a4end',
                name: 'a4end'
            }
        ]
    };*/



//    webfit.RangePanel = {
//        xtype       : 'form',
//        border      : false,
//        title: 'scanRange',
//        itemId: 'scanRange',
//        labelWidth: '2',
//        labelAlign: 'left',
//        labelPad: '5',
//        frame: true,
//        height: 350,
//        defaultMargin : {top: 0, right: 5, bottom: 0, left: 5},
//        padding: '0 5 0 5',
//        //columnWidth: 0.5,
//        //anchor: '85%',
//        layout: {
//            type:'anchor'
//        },
//        items: [webfit.a3FieldSet,webfit.a4FieldSet]
//    }

    webfit.a3start = Ext.create('Ext.slider.Single', {
        width: 200,
        value: 50,
        increment: 10,
        minValue: 0,
        maxValue: 100,
        tipText: function(thumb){
            return Ext.String.format('**{0}% complete**1', thumb.value);
        }
    });
    
    webfit.a3step = Ext.create('Ext.slider.Single', {
        width: 200,
        value: 50,
        increment: 10,
        minValue: 0,
        maxValue: 100,
        tipText: function(thumb){
            return Ext.String.format('**{0}% complete**2', thumb.value);
        }
    });
    
    webfit.a3end = Ext.create('Ext.slider.Single', {
        width: 200,
        value: 50,
        increment: 10,
        minValue: 0,
        maxValue: 100,
        tipText: function(thumb){
            return Ext.String.format('**{0}% complete**3', thumb.value);
        }
    });

    webfit.a3RangePanel = Ext.create('Ext.form.Panel', {
        title: 'A3 range',
        labelWidth: 75, // label settings here cascade unless overridden
        url: 'save-form.php',
        frame: true,
        //bodyStyle: 'padding:5px 5px 0',
        width: 400,
        height: 100,
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
        items:[webfit.a3start, webfit.a3step, webfit.a3end]//, webfit.a4FieldSet]
    });

    webfit.a4start = Ext.create('Ext.slider.Single', {
        width: 200,
        value: 50,
        //increment: 10,
        minValue: 0,
        maxValue: 100,
        renderTo: webfit.a4RangePanel
    });
    
    webfit.a4step = Ext.create('Ext.slider.Single', {
        width: 200,
        value: 50,
        increment: 10,
        minValue: 0,
        maxValue: 100,
        renderTo: webfit.a4RangePanel
    });
    
    webfit.a4end = Ext.create('Ext.slider.Single', {
        width: 200,
        value: 50,
        //increment: 10,
        minValue: 0,
        maxValue: 100,
        renderTo: webfit.a4RangePanel
    });

    webfit.a4RangePanel = Ext.create('Ext.form.Panel', {
        title: 'A4 range',
        labelWidth: 75, // label settings here cascade unless overridden
        url: 'save-form.php',
        frame: true,
        //bodyStyle: 'padding:5px 5px 0',
        width: 400,
        height: 100,
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
        items:[webfit.a4start, webfit.a4step, webfit.a4end]//, webfit.a4FieldSet]
    });

    webfit.radioGroup = Ext.create('Ext.form.Panel', {
        title: 'Graphing Options',
        width: 300,
        height: 125,
        bodyPadding: 10,
        //renderTo: Ext.getBody(),
        items:[{
            xtype: 'radiogroup',
            fieldLabel: 'Select one',
            // Arrange radio buttons into two columns, distributed vertically
            columns: 1,
            vertical: true,
            items: [
                { boxLabel: 'Gaussian', name: 'rb', inputValue: '1' },
                { boxLabel: 'Default', name: 'rb', inputValue: '2', checked: true}
            ]
        }]
    });

    webfit.TopPanel = Ext.create('Ext.form.Panel', {
        title: 'scanRanges',
        labelWidth: 75, // label settings here cascade unless overridden
        url: '/calculate/',
        frame: true,
        //bodyStyle: 'padding:5px 5px 0',
        width: 500,
        height: 600,
        autoscroll: true,
        //renderTo: Ext.getBody(),
        layout:  { type: 'vbox',
            //align: 'center'
        },
        //layoutConfig: {
        //    columns:1
        //},
        defaults: {
            bodyPadding: 4
        },
//        items: [webfit.a3RangePanel,
//        {
//            xtype: 'panel',
//            title: 'Inner Panel Two',
//            width: 250,
//            flex: 4
//        }]
        items:[webfit.a3RangePanel, webfit.a4RangePanel, webfit.radioGroup],
        buttons: [{
            text: 'Submit',
            handler: function() {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        success: function(form, action) {
                            var result=Ext.decode(action.response.responseText)
                            webfit.plot.series[0].data=result.series
                            webfit.plot.replot({resetAxes : true});
                           // Ext.Msg.alert('Success', action.result.message);
                        },
                        failure: function(form, action) {
                            Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
                        }
                    });
                } else {
                    Ext.Msg.alert( "Error!", "Your form is invalid!" );
                }
            }
        },
        {//TODO
            text: 'undo',
            handler: function() {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        success: function(form, action) {
                            var result=Ext.decode(action.response.responseText)
                            webfit.plot.series[0].data=result.series
                            webfit.plot.replot({resetAxes : true});
                           // Ext.Msg.alert('Success', action.result.message);
                        },
                        failure: function(form, action) {
                            Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
                        }
                    });
                } else {
                    Ext.Msg.alert( "Error!", "Unable to undo" );
                }
            }
        },
        {//TODO
            text: 'Show History',
            handler: function() {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        success: function(form, action) {
                            var result=Ext.decode(action.response.responseText)
                            webfit.plot.series[0].data=result.series
                            webfit.plot.replot({resetAxes : true});
                           // Ext.Msg.alert('Success', action.result.message);
                        },
                        failure: function(form, action) {
                            Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
                        }
                    });
                } else {
                    Ext.Msg.alert( "Error!", "Your form is invalid!" );
                }
            }
        }]//, webfit.a4FieldSet]
    });

   // webfit.TopPanel = new Ext.Panel({
   //     layout: 'table',
   //     width: 1100,
   //     layoutConfig: {
   //         columns: 2
   //     },
   //    items: [webfit.RangePanel]
   //});

    var button =  new Ext.Button({applyTo:'button-div',text:'CALCULATE!', minWidth: 130, handler: calculateHandler});
    var conn = new Ext.data.Connection();



    function calculateHandler(button, event) {
        params = {'observations': [] };
        params.a3range=[];
        params.a4range=[];

        var a3start = Ext.ComponentQuery.query('panel #scanRange')[0].getComponent('a3FieldSet').query('textfield[name="a3start"]')[0].value;
        var a3step = Ext.ComponentQuery.query('panel #scanRange')[0].getComponent('a3FieldSet').query('textfield[name="a3step"]')[0].value;
        var a3stop = Ext.ComponentQuery.query('panel #scanRange')[0].getComponent('a3FieldSet').query('textfield[name="a3stop"]')[0].value;
        var a4start = Ext.ComponentQuery.query('panel #scanRange')[0].getComponent('a4FieldSet').query('textfield[name="a4start"]')[0].value;
        var a4step = Ext.ComponentQuery.query('panel #scanRange')[0].getComponent('a4FieldSet').query('textfield[name="a4step"]')[0].value;
        var a4stop = Ext.ComponentQuery.query('panel #scanRange')[0].getComponent('a4FieldSet').query('textfield[name="a4stop"]')[0].value;
        params.a3range.push({
            a3start:a3start,
            a3step:a3step,
            a3stop:a3stop
        });




//        var data=Ext.JSON.encode(params);
//        $.ajax({
//            url: '/nuclear_scattering',
//            type: 'POST',
//            data: {'data' : data},
//            success: function(response) {
//                //projectid is not in scope here; calling another function that has it.
//                webfit.successFunction(response);
//            }
//        });
    }



    var menu = Ext.create('Ext.menu.Menu', {
        id: 'mainMenu',
        style: {
            overflow: 'visible',     // For the Combo popup

        },
        width: 300,
        height: 100,
        items: [
            {
                xtype : 'fileuploadfield',
                anchor : '100%',
                id : 'inputfile',
                emptyText : 'Select a file...',
                fieldLabel : 'File',
                name : 'file',
                buttonText : 'Browse...',
                labelWidth : 30

                //text: 'Upload Cif File',
                //checkHandler:cifFileHandler
            }],
        buttons: [{
            text: 'Upload',
           // handler: cifFileHandler
            //handler: function() {
            //var form = this.up('form').getForm();
            //if(form.isValid()){
            //form.submit({
            //url: 'photo-upload.php',
            //waitMsg: 'Uploading your photo...',
            //success: function(fp, o) {
            //Ext.Msg.alert('Success', 'Your photo "' + o.result.file + '" has been uploaded.');
            //}
            //});
            //}
            //}
        }]

        //checkHandler: cifFileHandler
        //handler: function() {
        //var form = this.up('form').getForm();
        //if(form.isValid()){
        //form.submit({
        //url: 'photo-upload.php',
        //waitMsg: 'Uploading your photo...',
        //success: function(fp, o) {
        //Ext.Msg.alert('Success', 'Your photo "' + o.result.file + '" has been uploaded.');
        //}
        //});
        //}
        //}


    });


    var tb = Ext.create('Ext.toolbar.Toolbar',{
        text: 'Users',
        iconCls: 'user',
        items:[
            {
                text:'File',
                iconCls: 'bmenu',  // <-- icon
                menu: menu  // assign menu by instance
            },]
    });




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
            //webfit.plot.series[0].data = [];
            
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

        
    

    var myTabs = new Ext.TabPanel({
        resizeTabs: true, // turn on tab resizing
        minTabWidth: 115,
        tabWidth: 800,
        enableTabScroll: true,
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
                items: [webfit.TopPanel, webfit.plotPanel]
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

// ************************** END - Setting up the tabs  **************************
    myTabs.render('tabs');
    
});