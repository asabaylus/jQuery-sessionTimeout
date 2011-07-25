/**
 * jQuery Session Timeout Plugin
 * Prevents sessions from timeing-out
 * @author Asa Baylus
 * @version 0.0.2
 *
 *
 * Copyright (c) 2011 Asa Baylus
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
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
		_sessionTimeoutTimer,
		_beforeTimeout,
		_beforeTimeoutTimer,
		_keepAliveTimer,
		_idleTimerExists = false,
		timesRestarted = 0;

	$.fn.sessionTimeout = function (options, method) {


		// set plugin defaults
		defaults = {
			autoping : true,
			timeout : 300000, // set the servers session timeout
			resource : "spacer.gif", // set the asset to load from the server
			promptfor : 10000, // triggers beforetimeout x seconds before session timeout
			beforetimeout : $.noop, // callback which occurs prior to session timeout
			ontimeout : $.noop, // callback which occurs upon session timeout
			pollactivity : 4000 // number seconds between checking for user activity (only needed if using idletimer)
		};

		methods = {


			/**
			 * Initializes the plugin
			 * @return {void}
			 * @private
			 */
			_init: function () {

				// test for Paul Irishes idleTimer plugin
				_idleTimerExists = $.isFunction($.fn.idleTimer);
				
				methods._startCountdown.apply();
												
				// get the load time for plugin ready
				_ready = new Date();				
				logEvent("$.fn.sessionTimeout status: initialized @ " + _ready.toTimeString());
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
					
				// stop session timeout countdown
				methods._stopCountdown.apply();
				
				// renew the session
				methods._fetch.apply();				
				
				logEvent("$.fn.sessionTimeout status: session restarted @ " + t.toTimeString());
				$(document).trigger("ping.sessionTimeout");
				
				// restart session timeout countdown
				methods._startCountdown.apply();
				

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
			 * Stops countdown to session exiration
			 * @return {void}
			 * @private
			 */			
			 _stopCountdown: function () {
					// stop the session timer
					window.clearTimeout(_sessionTimeoutTimer);
					window.clearTimeout(_beforeTimeoutTimer);
					window.clearTimeout(_keepAliveTimer);
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
				
					
				// if beforeTimeout is a function then start countdown to user prompt
				if ($.isFunction(options.beforetimeout)) {			
					_beforeTimeoutTimer = window.setTimeout(function () {
					
						console.log("running beforeTimeout");
						
						var d = new Date();
						logEvent("$.fn.sessionTimeout status: beforeTimeout triggered @" + d.toTimeString());
						options.beforetimeout.call(this);
						$(document).trigger("prompt.sessionTimeout");	

					}, options.timeout - options.promptfor);
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
					
					methods._stopCountdown.apply();
											
					var d = new Date();
					logEvent("$.fn.sessionTimeout status: session expired @" + d.toTimeString());
					$(document).trigger('expired.sessionTimeout');
				}, options.timeout); 


			},
			
			
			/**
			 * Starts countdown to session exiration
			 * @return {void}
			 * @private
			 */
			_startCountdown: function () {
					


					
					// In the end there can be only one - Ramirez
					window.clearInterval(_keepAliveTimer);

					// if autoping then never let sessions expire
					if (options.autoping === true) {
						_keepAliveTimer = window.setTimeout(function(){
							methods.ping.apply();
							}, timeout);
					}
					
					// if idleTimer plugin exists
					else if (_idleTimerExists){	
						
						// set idleTimer() equal to the session durration 
						$.idleTimer(options.pollactivity-1);
						
						// poll for user activity	
						_keepAliveTimer = window.setTimeout(function(){
							if ($.data(document,'idleTimer') === 'idle') {
								console.log(timesRestarted + " user is idle")
								methods._beforeTimeout.apply();
							} 
							else {
								console.log(timesRestarted + " user is active");
								methods.ping.apply();
							}						
						}, options.pollactivity);					
					} 				
					
					else {
						methods._beforeTimeout.apply();
					}
					
								timesRestarted++;		
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
			remaining : function (surpresslog) {
				var currentTime = new Date(),
					expiresTime = new Date(_ready.getTime() + options.timeout),
					// time until session expires in ms
					// use 0 if no time session has already expired
					remainingTime = (expiresTime - currentTime) > 0 ? expiresTime - currentTime : 0;
				
				if (!surpresslog){
					logEvent("$.fn.sessionTimeout status: remaining " + remainingTime + " ms");
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
					$("#" + _resourceId).remove();
					methods._stopCountdown.apply();
					_sessionTimeoutTimer = null;
					_beforeTimeout = null;
					_keepAliveTimer = null;
					_ready = null;			
					logEvent("$.fn.sessionTimeout status: destroy");
					$(document).trigger("destroy.sessionTimeout");			
					// unbind all sessionTimeout events
					$(document).unbind("sessionTimeout");
					if (_idleTimerExists) {
						$(document).unbind("idleTimer");
					}
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
			return methods._init.apply(this);
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


})(jQuery);