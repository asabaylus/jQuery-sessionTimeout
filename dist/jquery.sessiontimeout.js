/*! jQuery Session Timeout - v0.1.0 - 2012-06-30
* https://github.com/asabaylus/jQuery-sessionTimeout
* Copyright (c) 2012 Asa Baylus; Licensed MIT, GPL */

(function ($) {

    var defaults,
        methods,
        logEvent,
        $global = {},
        _log = [], // contains plugin history
        _start = new Date(),
        _resourceId = 'sessionTimeout_' + _start.getTime(),
        _version = "0.0.1",
        _ready,
        _sessionTimeout,
        _beforeTimeout;

    $.fn.sessionTimeout = function (options, method) {


        // set plugin defaults
        defaults = {
            autoping : true,
            timeout : 300000, // set the servers session timeout
            resource: "spacer.gif", // set the asset to load from the server
            promptfor: 10000, // triggers beforetimeout x seconds before session timeout
            beforetimeout: $.noop, // callback which occurs prior to session timeout
            ontimeout : $.noop // callback which occurs upon session timeout
        };

        methods = {


            /**
             * Initializes the plugin
             * @return {void}
             * @private
             */
            _init: function () {

                // reset the session timer
                window.clearInterval(_sessionTimeout);

                // start counting down to session timeout
                _sessionTimeout = window.setInterval(function () {

                    // if autoping is not true session will eventualy timeout
                    if (options.autoping === false) { 

                        // handle the ontimeout callback
                        // first check that a function was passed in
                        if ($.isFunction(options.ontimeout)) {
                            options.ontimeout.call(this);
                            // stop the session timer
                            window.clearInterval(_sessionTimeout);
                            var d = new Date();
                            logEvent("$.fn.sessionTimeout status: session expired @" + d.toTimeString());
                            $(document).trigger('expired.sessionTimeout');

                        }
                        else {
                            $.error('The jQuery.sessionTimeout ontimeout parameter is expecting a function');
                        }

                    }
                    // if autoping is true,
                    // when countdown is complete ping the sever
                    else {
                        methods.ping.apply(this, arguments);
                    }               

                }, options.timeout); 
                
                // only run before time if autoping is not true
                if (!options.autoping) {
                    _beforeTimeout = window.setTimeout(function () {
                        var d = new Date();
                        logEvent("$.fn.sessionTimeout status: beforeTimeout triggered @" + d.toTimeString());
                        if ($.isFunction(options.beforetimeout)) {
                            options.beforetimeout.call(this);
                        } else {
                            $.error("The jQuery.sessionTimeout beforetimeout parameter is expecting a function");
                        }
                        $(document).trigger("prompt.sessionTimeout");   
                    }, options.timeout - options.promptfor);
                }
                
                // get the load time for plugin ready
                _ready = new Date();                
                logEvent("$.fn.sessionTimeout status: initialized");
                $(document).trigger("create.sessionTimeout", [_version, _start, (_ready - _start)]);


            },
            
            /**
             * Requests a file from target server
             * @return {void}
             * @public
             */
            ping: function () {

                var t = new Date(),
                    tstamp = t.getTime();


                // ping the server to keep alive
                // thanks to Jake Opines
                // http://www.atalasoft.com/cs/blogs/jake/archive/2008/12/19/creating-a-simple-ajax-sessionTimeout.aspx 
                // see http://docs.jquery.com/Release:jQuery_1.2/Internals for unique ids

                // if plugin was not initialized throw an error
                if (typeof _sessionTimeout === "undefined") {
                    $.error('Initialize $.fn.sessionTimeout before invoking method "ping".');
                    return;
                }

                // renew the session
                methods._fetch.apply();             
                logEvent("$.fn.sessionTimeout status: session restarted @ " + t.toTimeString());
                $(document).trigger("ping.sessionTimeout");
                
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
                if (!$("#" + _resourceId).length) {


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

                    $("#" + _resourceId).attr("src", options.resource + "?timestamp=" + tstamp);
                }
            
            },
            
            
            /**
             * Callback function occurs when promt begins
             * @return {void}
             * @private
             */
            _beforeTimeout: function () {

                // if beforeTimeout is a function then start countdown to user prompt
                if ($.isFunction(options.beforetimeout)) {
                    _beforeTimeout = window.setTimeout(function () {
                        var d = new Date();
                        logEvent("$.fn.sessionTimeout status: beforeTimeout triggered @" + d.toTimeString());
                
                        options.beforetimeout.call(this);
                        $(document).trigger("prompt.sessionTimeout");   

                    }, options.timeout - options.promptfor);
                }
                else {
                    $.error("The jQuery.sessionTimeout beforetimeout parameter is expecting a function");
                }

            },


            /**
             * Returns session duration (ms)
             * @return {number}
             * @public
             */
            duration : function () {
                logEvent("$.fn.sessionTimeout status: duration " + options.timeout);
                return options.timeout;
            },



            /**
             * Returns time elapsed since session began
             * @return {date}
             * @public
             */
            elapsed : function () {
                var d = new Date() - _ready;                
                logEvent("$.fn.sessionTimeout status: elapsed " + d + " ms");
                return d;
            },
            
            

            /**
             * Returns time remaining before session expires
             * @return {date}
             * @public
             */         
            remaining : function () {
                var currentTime = new Date(),
                    expiresTime = new Date(_ready.getTime() + options.timeout),
                    // time until session expires in ms
                    // use 0 if no time session has already expired
                    remainingTime = (expiresTime - currentTime) > 0 ? expiresTime - currentTime : 0;
                logEvent("$.fn.sessionTimeout status: remaining " + remainingTime + " ms");
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
                    $("#" + _resourceId).remove();
                    window.clearInterval(_sessionTimeout);
                    window.clearTimeout(_beforeTimeout);
                    _ready = undefined;         
                    logEvent("$.fn.sessionTimeout status: destroy");
                    $(document).trigger("destroy.sessionTimeout");          
                    // unbind all sessionTimeout events
                    $(document).unbind("sessionTimeout");
                    // delete the log
                    _log.length = 0;
                } else {
                    $.error("Could not destroy, initialize the plugin before calling destroy.");    
                }
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


        // if the user specified an option which is also
        // a method then copy the options into the methods
        // this allow directly invoking a method like so 
        // $.fn.sessionTimeout("destroy");
        if (methods[options]) {
            method = options;
        }
        
        // set the options
        //options = $.extend(defaults, options);
        // thanks @ssoper   
        $.extend($global, options);
        options = $.extend(defaults, $global);


        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods._init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.sessionTimeout');
        }


        // log event records events into an array
        // *note log event must occur before triggering the bindings
        function logEvent(str) {
            _log.push(str);
            $(document).trigger("eventLogged.sessionTimeout");
        }


    };


}(jQuery));