Ext.define("Rally.app.ClarityTimesheetLauncher", {
    extend: 'Rally.app.App',

    logger: new Rally.technicalservices.Logger(),

    mixins: ['Rally.clientmetrics.ClientMetricsRecordable'],

    appName: 'Clarity Timesheet Launcher',

    config: {
        defaultSettings: {
            ppmHost: null,
            ppmPort: 443
        }
    },
    autoScroll: false,
    timesheetSuffix:  '/pm/#/timesheets',
    loggedInMessage:  "Connection to Clarity server <a href=\"{0}\" target=\"clarityWindow\">{1}</a> launched.<br/><br/><a href=\"{0}\" target=\"clarityWindow\">Click here to access or re-launch</a>.",
//https://knowledge.broadcom.com/external/article?articleId=206489
    launch: function() {

        var server = this.getPPMHost(),
            port = this.getPPMPort();

         this.validateConfig(server, port).then({
                success: this.addLauncher,
                failure: this.showAppMessage,
                scope: this
        });
    },
    addLauncher: function(){
        var server = this.getPPMHost(),
        port = this.getPPMPort(),
        url = this.buildPPMTimesheetURL(server, port),
        height = this.getHeight() || 600;
        this.logger.log("addLauncher",url);

        var msg = Ext.String.format(this.loggedInMessage, url, server);
        this.add({
            xtype: 'container',
            html: '<div class="secondary-message" style="font-family: ProximaNova,Helvetica,Arial;text-align:center;color:#8a8a8a;font-size:12pt;font-style:italic">' + msg
        });
        
        this.launchWindow(url);
    },
    launchWindow: function(url){
        if (!this.currentWindow || this.currentWindow.closed === true){
            this.currentWindow = window.open(url,'clarityWindow') //,'toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,width=700,height=600');
        } else {
            this.currentWindow.focus();
        }
    },

    validateConfig: function(server, port){
        var deferred = Ext.create('Deft.Deferred');

        if (!server){
            deferred.reject("No Clarity Server and Port is configured.  Please work with an administrator to configure your Clarity https server.");
        } else {
            deferred.resolve();
        }

        return deferred;
    },
    buildPPMTimesheetURL: function(server, port){
        var url = Ext.String.format("https://{0}",server);
        if (port){
            url = Ext.String.format("{0}:{1}", url, port);
        }
        return url + this.timesheetSuffix;
    },
    getPPMHost: function(){
        return this.getSetting('ppmHost') || null;
    },
    getPPMPort: function(){
        return this.getSetting('ppmPort') || null;
    },
    showAppMessage: function(msg){
        this.removeAll();
        this.add({
            xtype: 'container',
            html: Ext.String.format('<div class="no-data-container"><div class="secondary-message">{0}</div></div>',msg)
        });
    },
    getSettingsFields: function () {

        return [{
            xtype: 'container',
            html: '<div class="secondary-message" style="font-family: ProximaNovaBold,Helvetica,Arial;text-align:left;color:#B81B10;font-size:12pt;">NOTE:  The Clarity server must be version 15.2 or above.</div>'
        },{
            name: 'ppmHost',
            xtype: 'rallytextfield',
            width: 400,
            labelWidth: 100,
            labelAlign: 'right',
            fieldLabel: 'Clarity Host name',
            margin: '10 0 10 0',
            maskRe:  /[a-zA-Z0-9\.\-]/,
            emptyText: 'Please enter a Host name or IP Address...',
            maxLength: 255
        },{
            name: 'ppmPort',
            xtype:'rallynumberfield',
            labelAlign: 'right',
            fieldLabel: 'Port (HTTPS)',
            labelWidth: 100,
            emptyText: 443,
            minValue: 0,
            maxValue: 65535,
            allowBlank: true,
            allowDecimals: false,
            allowExponential: false
        }];
    }
});