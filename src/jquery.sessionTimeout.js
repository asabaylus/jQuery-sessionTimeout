/*global document: true, window: true, jQuery: true */
/**
 * jQuery Session Timeout Plugin
 * Prevents sessions from timeing-out
 * @author Asa Baylus
 * @version 0.0.2
 *
 * Copyright (c) 2012 Asa Baylus
 * Licensed under the MIT, GPL licenses.
 */
(function($) {

	// "use strict";

	var methods = {},
		options, $global = {},
		_log = [],
		// contains plugin history
		_start = new Date(),
		_resourceId = 'sessionTimeout_' + _start.getTime(),
		$el, $idleTimerEl, _activityPoller, enableidletimer, _version = "0.0.2",
		_ready, // when the plugin first initialized
		_sessionTimeoutTimer, _beforeTimeout,  _idleTimerExists = false,
		_countdownDate, _countdownTime, _endTime, _keepAliveTimer,

		// set plugin defaults
		defaults = {
			autoping: false,
			enableidletimer: true,
			// allows session control via idletimer plugin if present
			timeout: 300000,
			// set the servers session timeout
			resource: "spacer.gif",
			// set the asset to load from the server
			promptfor: 10000,
			// triggers onprompt x seconds before session timeout
			onprompt: $.noop,
			// callback which occurs prior to session timeout
			ontimeout: $.noop,
			// callback which occurs upon session timeout
			pollactivity: 1000 // number seconds between checking for user activity (only needed if using idletimer)
		};
	
	
	$.fn.sessionTimeout = function(method, options) {

		methods = {


			/**
			 * Initializes the plugin
			 * @return {void}
			 * @private
			 */
			_init: function() {


				// test for Paul Irishes idleTimer plugin
				_idleTimerExists = $.isFunction($.idleTimer);
				if ( _idleTimerExists ){
					$idleTimerEl = $(document);
				}

				// prompt durration cannot be longer than 
				// session durration
				if (options.promptfor > options.timeout){
					options.promptfor = options.timeout;
				}

				methods._startCountdown.apply();

				// get the load time for plugin ready
				_ready = new Date();


				$(document).trigger("create.sessionTimeout", [_version, _start, (_ready - _start)]);
			},


			/**
			 * Starts countdown to session exiration
			 * @return {void}
			 * @private
			 */
			_startCountdown: function() {

				// console.log('starting coutndown with options', options);
				_countdownDate = new Date();
				_countdownTime = _countdownDate.getTime();
				_endTime = _countdownTime + options.timeout;
				
				

				if(options.autoping === true) {
					 _keepAliveTimer = window.setTimeout(function() {
						methods.ping.apply();
					}, options.timeout);
				}	
				// if idleTimer plugin exists
				// when user goes idle restart the countdown
				//    less the polling time used for idleTimer
				// cancel the current countdown when the user is active
				//    ping the server
				else if(_idleTimerExists && options.enableidletimer) {

						console.log( _idleTimerExists, options.enableidletimer);

					

					// set idleTimer() equal to the session durration
					$.idleTimer(Number(options.pollactivity));

					// if(options.pollactivity > options.timeout - options.promptfor) {
					// 	$.error("The configuration pollactivity is too long: polling must happen prior to the onprompt callback.");
					// 	return false;
					// }
				

					window.clearTimeout( _keepAliveTimer);
					window.clearTimeout(_activityPoller);
					 _keepAliveTimer = window.setTimeout(function() {
						methods._beforeTimeout.apply();
					}, options.timeout - options.promptfor);


					$idleTimerEl.one('active.idleTimer', function() {

						// if autoping is on then cancel the beforeTimeout event
						// because the session will never expire.
						// otherwise we will promt the user for input
						// removed options.autoping === true &&
						// _beforeTimeout canceled
						methods._stopCountdown.apply();


						methods.ping.apply();

						// user may be active for length of the session.
						// if so prevent the session  from timing out
						_activityPoller = window.setTimeout(function() {
							methods.ping.apply();
						}, options.timeout);

					});

					$idleTimerEl.one('idle.idleTimer', function() {
						// on idle prevent activity poller
						// from restarting sessions.
						window.clearTimeout(_activityPoller);

					});

					$(document).bind('expired.sessionTimeout', function() {
						$idleTimerEl.unbind('active.idleTimer');
						$idleTimerEl.unbind('idle.idleTimer');

					});


					// When page first loads begin the countdown immediately
					if(typeof $.data(document, 'idleTimer') === "undefined") {
						$idleTimerEl.trigger('idle.idleTimer');
					}
				} else {

					window.clearTimeout( _keepAliveTimer);
					 _keepAliveTimer = window.setTimeout(function() {
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
			_stopCountdown: function() {
				// stop the session timer
				window.clearTimeout(_sessionTimeoutTimer);
				window.clearTimeout( _keepAliveTimer);
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
			_beforeTimeout: function() {
				
				// if beforeTimeout is a function then start countdown to user prompt
				if($.isFunction(options.onprompt)) {
					var d = new Date();

					options.onprompt.call(this);
					$(document).trigger("prompt.sessionTimeout");
				} else {
					$.error("The jQuery.sessionTimeout onprompt parameter is expecting a function");
				}

				// start counting down to session timeout
				_sessionTimeoutTimer = window.setTimeout(function() {

					// handle the ontimeout callback
					// first check that a function was passed in
					if($.isFunction(options.ontimeout)) {
						options.ontimeout.call(this);
					} else {
						//throw new Error('The jQuery.sessionTimeout ontimeout parameter is expecting a function');
						$.error('The jQuery.sessionTimeout ontimeout parameter is expecting a function');
					}

					// TODO: if idletimer is enable && user is active
					// restart the session timeout countdown.
					// console.log("method apply: _beforeTimeout", _idleTimerExists, options.enableidletimer);
					methods._stopCountdown.apply();

					var d = new Date();

					$(document).trigger('expired.sessionTimeout');
				}, options.promptfor);
			},


			/**
			 * Loads resource, PHP, ASPX, CFM, JSP or Image file etc
			 * @return {void}
			 * @private
			 */
			_fetch: function() {

				var d = new Date(),
					tstamp = d.getTime(),
					reFileName = /^(.+)\.([^\.]*)?$/,
					reImageExt = /^jpg|jpeg|png|gif|bmp$/,
					file = options.resource.match(reFileName),
					extension = file[2],
					isImage = reImageExt.test(extension);

				// loads the resource used to ping target server
				// if the resource dosnt exist
				if(typeof $el === 'undefined') {

					// handle loading the resource the first time
					if(isImage) {
						// get an image with a unique id
						// fetching the image will keep the server from timeing out
						// it's important that the file has a defined
						// filesize ex no includes or scripts
						$("body").append("<img id='" + _resourceId + "' src='" + options.resource + "?tstamp=" + tstamp + "' style='position: \"absolute\", height: \"1px\", width: \"1px\"' alt='web page session management helper'>");
					} else {
						$("body").append("<iframe id='" + _resourceId + "' src='" + options.resource + "?tstamp=" + tstamp + "' style='position: \"absolute\", height: \"1px\", width: \"1px\", display: \"none\"' alt='web page session management helper'></iframe>");
					}

				} else {

					$el.attr("src", options.resource + "?timestamp=" + tstamp);
				}

				$el = $("#" + _resourceId);
			},

			/**
			 * Requests a file from target server
			 * @return {void}
			 * @public
			 */
			ping: function() {
				var t = new Date(),
					tstamp = t.getTime();

				// dont ping nothin if the user is idle
				// if ( _idleTimerExists && $.data(document,'idleTimer') === 'idle' ){
				//     return false;
				// }
				// stop session timeout countdown
				methods._stopCountdown.apply();

				// renew the session
				methods._fetch.apply();

				// restart session timeout countdown
				methods._startCountdown.apply();

				$(document).trigger("ping.sessionTimeout");
			},


			/**
			 * Returns session duration (ms)
			 * @return {number}
			 * @public
			 */
			duration: function(surpresslog) {
				// if (!surpresslog){
				// }
				return Number(options.timeout);
			},


			/**
			 * Returns time elapsed in ms since session began
			 * @return {date}
			 * @public
			 */
			elapsed: function() {
				var d = new Date() - _ready || undefined;
				// console.log("elapsed " + d + " ms");
				return d;
			},


			/**
			 * Returns time remaining before session expires
			 * @return {number}
			 * @public
			 */
			remaining: function(surpresslog) {
				var currentDate = new Date(),
					currentTime = currentDate.getTime(),
					expiresTime = _countdownTime,
					durration = Number(options.timeout),
					// time until session expires in ms
					// use 0 if no time session has already expired
					remainingTime = durration + (expiresTime - currentTime) > 0 ? durration + (expiresTime - currentTime) : 0;

				// if (!surpresslog){
				// }
				// if the plugin was destroyed then return undefined
				// otherwise return the time remaining
				return typeof _ready === 'undefined' ? undefined : remainingTime;
			},


			/**
			 * Resets plugin to default state
			 * @return {void}
			 * @public
			 */
			destroy: function() {

				// remove ping image from DOM
				if(typeof $el !== 'undefined') {
					$el.remove();
				}

				methods._stopCountdown.apply();
				
				if(_idleTimerExists) {
					$idleTimerEl.unbind('.idleTimer');
				}

				_ready = undefined;
				//_countdownTime = undefined;

				$(document).trigger("destroy.sessionTimeout");

				// unbind all sessionTimeout events
				$(document).off(".sessionTimeout");
				
				if(_idleTimerExists) {
					// destroy idletimer
					$idleTimerEl.idleTimer('destroy');
				}
			},


			/**
			 * Returns session countdown start time
			 * @return number
			 * @public
			 */
			getStartTime: function() {
				return _countdownTime;
			},

			/**
			 * Returns session countdown end time
			 * @return number
			 * @public
			 */
			getEndTime: function() {
				return _endTime;
			},

			/**
			 * Returns session keepalive timer
			 * @return timer
			 * @public
			 */
			getKeepAliveTimer: function() {
				return _keepAliveTimer;
			},			

			/**
			 * Returns the element injected into the DOM,
			 * which was used to renew the users session
			 * @return number
			 * @public
			 */
			getResourceLoaded: function() {
				return $el;
			}
		};

		// if method is not set and options are specified
		// copy the method into the options
		// this allow directly invoking options like so
		// $.fn.sessionTimeout({ opt1 : val1, opt2: val2, ... });
		if(!methods[options]) {
			options = $.extend(options, method);
		}

		// set the options
		options = $.extend(defaults, options);

		// Method calling logic
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if(typeof method === 'object' || !method) {
			return methods._init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.sessionTimeout');
		}

	};

}(jQuery));