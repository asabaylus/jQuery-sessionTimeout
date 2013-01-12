/*! jQuery Session Timeout - v0.1.0 - 2012-12-04
* https://github.com/asabaylus/jQuery-sessionTimeout
* Copyright (c) 2012 Asa Baylus; Licensed MIT, GPL */

(function ($) {

    var methods = {},
        _logEvent,
        options,
        $global = {},
        _log = [], // contains plugin history
        _start = new Date(),
        _resourceId = 'sessionTimeout_' + _start.getTime(),
        $el,
        $idleTimerEl,
        _activityPoller,
        enableidletimer,
        _version = "0.0.1",
        _ready, // when the plugin first initialized
        _sessionTimeoutTimer,
        _beforeTimeout,
        _keepAliveTimer,
        _idleTimerExists = false,
        _countdownDate,
        _countdownTime,

        // set plugin defaults
        defaults = {
            autoping : false,
            enableidletimer : true, // allows session control via idletimer plugin if present
            timeout : 300000, // set the servers session timeout
            resource: "spacer.gif", // set the asset to load from the server
            promptfor: 10000, // triggers beforetimeout x seconds before session timeout
            beforetimeout: $.noop, // callback which occurs prior to session timeout
            ontimeout : $.noop, // callback which occurs upon session timeout
            pollactivity : 1000 // number seconds between checking for user activity (only needed if using idletimer)
        };

            
    $.fn.sessionTimeout = function (method, options) {

        

        methods = {


            /**
             * Initializes the plugin
             * @return {void}
             * @private
             */
            _init: function () {


                    // test for Paul Irishes idleTimer plugin
                    _idleTimerExists = $.isFunction($.idleTimer);

                    if (_idleTimerExists){

                        $idleTimerEl = $(document);

                        // set idleTimer() equal to the session durration 
                        $.idleTimer(Number(options.pollactivity));

                        if (options.pollactivity > options.timeout - options.promptfor){
                            $.error("The configuration pollactivity is too long: polling must happen prior to the beforetimeout callback.");
                            return false;
                    }
                    }               

                    methods._startCountdown.apply();
                                                    
                    // get the load time for plugin ready
                    _ready = new Date();          
                    
                    //methods._logEvent().apply(this, "$.fn.sessionTimeout status: initialized @ " + _ready.toTimeString());
                    $(document).trigger("create.sessionTimeout", [_version, _start, (_ready - _start)]);
                },


                /**
                * Starts countdown to session exiration
                * @return {void}
                * @private
                */
                _startCountdown: function () {

                    // console.log('starting coutndown with options', options);
                        
                        _countdownDate = new Date();
                        _countdownTime = _countdownDate.getTime();

                        // if idleTimer plugin exists
                        // 1. when user goes idle restart the countdown
                        //    less the polling time used for idleTimer
                        // 2. cancel the current countdown when the user is active
                        //    ping the server 
                                           
                        if ( options.autoping === true) {
                            _keepAliveTimer = window.setTimeout(function(){
                                methods.ping.apply();
                }, options.timeout); 
                        }   
                        else if (_idleTimerExists && options.enableidletimer){
                
                            clearTimeout(_keepAliveTimer);
                            clearTimeout(_activityPoller);
                            _keepAliveTimer = window.setTimeout(function(){
                                  methods._beforeTimeout.apply();
                            }, options.timeout - options.promptfor);                    
                        
                             
                            $idleTimerEl.one('active.idleTimer', function(){

                                //console.log('active again!'); 
                                // if autoping is on then cancel the beforeTimeout event 
                                // because the session will never expire.
                                // otherwise we will promt the user for input
                                // removed options.autoping === true &&

                                // _beforeTimeout canceled
                                methods._stopCountdown.apply();


                                methods.ping.apply();

                                // user may be active for length of the session.
                                // if so prevent the session  from timing out
                                _activityPoller = setTimeout(function(){
                                        methods.ping.apply();
                                }, options.timeout);

                            });

                            $idleTimerEl.one('idle.idleTimer', function(){ 
                                // on idle prevent activity poller
                                // from restarting sessions.
                                clearTimeout(_activityPoller);

                            });

                            $(document).bind('expired.sessionTimeout', function(){
                                 $idleTimerEl.unbind('active.idleTimer');
                                 $idleTimerEl.unbind('idle.idleTimer');
                                    
                            }); 


                            // When page first loads begin the countdown immediately
                            if(typeof $.data(document, 'idleTimer') === "undefined"){
                                $idleTimerEl.trigger('idle.idleTimer');
                        }
                        }             
                        else {
                            
                            clearTimeout(_keepAliveTimer);
                            _keepAliveTimer = window.setTimeout(function(){
                                // console.log("dobeofretimeout!!!");
                                    methods._beforeTimeout.apply();
                    }, options.timeout - options.promptfor);
                }
                
                        $(document).trigger('startCountdown.sessionTimeout');   
                },


                /**
                 * Stops countdown to session exiration
                 * @return {void}
                 * @private
                 */         
                _stopCountdown: function () {
                        // stop the session timer
                        window.clearTimeout(_sessionTimeoutTimer);
                        window.clearTimeout(_keepAliveTimer);
                        window.clearTimeout(_activityPoller);
            },
            

            /**
                 * Callback function occurs when promt begins
                 * Once the beforeTimeout event has trigger, the session can no longer be renewed
                 * through autoping or idleTimer user activity. It is assumed the session timeOut
                 * must be cancled by "pinging" the server. ex: $.fn.sessionTimeout("ping");
             * @return {void}
                 * @private
             */
                _beforeTimeout: function () {
                    // console.log('bang!');                                 
                    // if beforeTimeout is a function then start countdown to user prompt
                    if ($.isFunction(options.beforetimeout)) {          
                            var d = new Date();
                            methods._logEvent("$.fn.sessionTimeout status: beforeTimeout triggered @" + d.toTimeString());
                            options.beforetimeout.call(this);
                            $(document).trigger("prompt.sessionTimeout");   
                    }
                    else {
                        $.error("The jQuery.sessionTimeout beforetimeout parameter is expecting a function");
                    }

                    // start counting down to session timeout
                    _sessionTimeoutTimer = window.setTimeout(function () {                  

                        // handle the ontimeout callback
                        // first check that a function was passed in
                        if ($.isFunction(options.ontimeout)) {
                            options.ontimeout.call(this);
                        }
                        else {
                            $.error('The jQuery.sessionTimeout ontimeout parameter is expecting a function');
                            return false;
                        }

                    // TODO: if idletimer is enable && user is active 
                    // restart the session timeout countdown.
                    // console.log("method apply: _beforeTimeout", _idleTimerExists, options.enableidletimer);

                        methods._stopCountdown.apply();

                        var d = new Date();
                        //"$.fn.sessionTimeout status: session expired @" + d.toTimeString()
                
                        $(document).trigger('expired.sessionTimeout');
                    }, options.promptfor);
            },
            
            
            /**
             * Loads resource, PHP, ASPX, CFM, JSP or Image file etc
             * @return {void}
             * @private
             */
            _fetch: function () {

                var d = new Date(),
                    tstamp = d.getTime(),
                    reFileName = /^(.+)\.([^\.]*)?$/,
                    reImageExt = /^jpg|jpeg|png|gif|bmp$/,
                    file = options.resource.match(reFileName),
                    extension = file[2],
                    isImage = reImageExt.test(extension);

                // loads the resource used to ping target server
                // if the resource dosnt exist
                    if (typeof $el === 'undefined') {

                    // handle loading the resource the first time
                    if (isImage) {
                        // get an image with a unique id
                        // fetching the image will keep the server from timeing out
                        // it's important that the file has a defined
                        // filesize ex no includes or scripts
                        $("body").append("<img id='" + _resourceId + "' src='" + options.resource + "?tstamp=" + tstamp  + "' style='position: \"absolute\", height: \"1px\", width: \"1px\"' alt='web page session management helper'>");
                    } else {
                        $("body").append("<iframe id='" + _resourceId + "' src='" + options.resource + "?tstamp=" + tstamp  + "' style='position: \"absolute\", height: \"1px\", width: \"1px\", display: \"none\"' alt='web page session management helper'></iframe>");
                    }

                } 
                else {

                        $el.attr("src", options.resource + "?timestamp=" + tstamp);
                }
            
                    $el = $("#" + _resourceId);
            },
            
            /**
                 * Requests a file from target server
             * @return {void}
                 * @public
             */
                ping: function () {
                    var t = new Date(),
                        tstamp = t.getTime();

                    // dont ping nothin of the user is idle
                    if ( _idleTimerExists && $.data(document,'idleTimer') === 'idle' ){
                        return false;
                    }   
                
                    // stop session timeout countdown
                    methods._stopCountdown.apply();

                    // renew the session
                    methods._fetch.apply();             
                    
                    methods._logEvent("$.fn.sessionTimeout status: session restarted @ " + t.toTimeString());
                    $(document).trigger("ping.sessionTimeout");
                    
                    // if idleTimer is present than the next countdown is bound to the activity of the user otherwise
                    // restart session timeout countdown
                    if ( _idleTimerExists ){
                        methods._startCountdown.apply();
                }
            },


            /**
             * Returns session duration (ms)
             * @return {number}
             * @public
             */
                duration : function (surpresslog) {
                    if (!surpresslog){
                        methods._logEvent("$.fn.sessionTimeout status: duration " + options.timeout);
                    }
                    return Number(options.timeout);
            },


            /**
             * Returns time elapsed since session began
             * @return {date}
             * @public
             */
            elapsed : function () {
                var d = new Date() - _ready;                
                    methods._logEvent("$.fn.sessionTimeout status: elapsed " + d + " ms");
                return d;
            },
            
            
            /**
             * Returns time remaining before session expires
                 * @return {number}
             * @public
             */         
                remaining : function (surpresslog) {
                    var currentDate = new Date(),
                        currentTime = currentDate.getTime(),
                        expiresTime = _countdownTime,
                        durration = Number(options.timeout),
                    // time until session expires in ms
                    // use 0 if no time session has already expired
                        remainingTime =  durration + (expiresTime - currentTime) > 0 ?  durration + (expiresTime - currentTime) : 0;
                        
                        //console.log(expiresTime, currentTime, durration + (expiresTime - currentTime));
                       

                    if (!surpresslog){
                        methods._logEvent("$.fn.sessionTimeout status: remaining " + remainingTime + " ms");
                    }
                return remainingTime;
            },


            /**
             * Resets plugin to default state
             * @return {void}
             * @public
             */
            destroy : function () {

                // before running cleanup check for plugin init
                if (typeof _ready !== "undefined") {

                    // remove ping image from DOM
                        if (typeof $el !== 'undefined'){
                            $el.remove();
                        }
                        methods._stopCountdown.apply();
                        if (_idleTimerExists){
                            $idleTimerEl.unbind('.idleTimer');
                        }
                        _sessionTimeoutTimer = null;
                        _beforeTimeout = null;
                        _keepAliveTimer = null;
                    _ready = undefined;         
                             
                        methods._logEvent("$.fn.sessionTimeout status: destroy");
                    $(document).trigger("destroy.sessionTimeout");          
                    // unbind all sessionTimeout events
                        $(document).unbind(".sessionTimeout");
                        if (_idleTimerExists) {
                            // destroy idletimer
                             $idleTimerEl.idleTimer('destroy');
                        }
                    // delete the log
                    _log.length = 0;
                } else {
                    $.error("Could not destroy, initialize the plugin before calling destroy.");    
                }
            },
            
            
                // log event records events into an array
                // *note log event must occur before triggering the bindings
                _logEvent : function ( str ){
                    _log.push(str);
                    $(document).trigger("eventLogged.sessionTimeout");
                },

   
            /**
             * Returns log of plugin events
             * @return {array}
             * @public
             */         
            printLog : function () {
                // returns an array of all logged events
                return _log;
            }
        };

        // console.log(method, options);

        // if method is not set and options are specified
        // copy the method into the options
        // this allow directly invoking options like so 
        // $.fn.sessionTimeout({ opt1 : val1, opt2: val2, ... });
        if (!methods[options]) {
            options = $.extend(options, method);
        }
        
        // set the options
        options = $.extend(defaults, options);
        // thanks @ssoper   
        //$.extend($global, options);
        //options = $.extend(defaults, $global);

        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods._init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.sessionTimeout');
        }

    };


}(jQuery));