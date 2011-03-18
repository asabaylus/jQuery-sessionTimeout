/**
 * jQuery Session Timeout Plugin
 * Prevents sessions from timeing-out
 * @author Asa Baylus
 * @version 0.0.1
 */ 


(function ($) {

	var $global = {},
		_log = [], // contains plugin history
		_start = new Date(),
		_resourceId = 'sessionTimeout_'+ _start.getTime(),
		_version = "0.0.1",
		_sessionTimeout = "";
		
	$.fn.sessionTimeout = function(options, method){
	

	    // set plugin defaults
	    defaults = {
	    	autoping : true,
			timeout : 300000, // set the servers session timeout
			resource: "spacer.jpg", // set the asset to load from the server
			promptfor: 10000, // triggers beforetimeout x seconds before session timeout
			beforetimeout: function() {}, // callback which occurs prior to session timeout
			ontimeout : function() {} // callback which occurs upon session timeout
	   	};
		
		methods = {
		
			_init: function() {
					
				
				methods._fetch.apply();
				

				// if beforeTimeout is a function then start countdown to user prompt
				if($.isFunction(options.beforetimeout)) {
					_beforeTimeout = window.setTimeout(function(){
					
									
							var d = new Date();
								logEvent("$.fn.sessionTimeout status: beforeTimeout triggered @" + d.toTimeString());
					
							options.beforetimeout.call( this );	
							$(document).trigger('prompt.sessionTimeout');	
					

						}, options.timeout - options.promptfor);
				}
				else {
					$.error( 'The jQuery.sessionTimeout beforetimeout parameter is expecting a function' );
				}

				// reset the session timer
				window.clearTimeout(_sessionTimeout);

				// start counting down to session timeout
				_sessionTimeout = window.setTimeout(function(){
					
					// if autoping is true,
					// when countdown is complete ping the sever
					if ( options.autoping === true ) {

						methods.ping.apply( this, arguments );
						

						// don't let the session expire
						return;
					}
					
					
					
					// handle the ontimeout callback
					// first check that a function was passed in
					if ($.isFunction(options.ontimeout)) {
							options.ontimeout.call( this );										
							
							var d = new Date();
								logEvent("$.fn.sessionTimeout status: session expired @" + d.toTimeString());
							
							$(document).trigger('expired.sessionTimeout');
					} 
					else {
							 $.error( 'The jQuery.sessionTimeout ontimeout parameter is expecting a function' );
					}

					
				
				}, options.timeout ); 
				
				// get the load time for plugin ready
				_ready = new Date();
				
				logEvent("$.fn.sessionTimeout status: initialized");
				
				$(document).trigger("create.sessionTimeout", [ _version, _start, (_ready - _start)] );
				
				
			},
			
			_fetch: function( ) {
				
				// loads the resource used to ping target server
				// if the resource dosnt exist
				if (!$("#"+_resourceId).length){
					var d = new Date(),
						tstamp = d.getTime(),
						reFileName = /^(.+)\.([^\.]*)?$/,
						reImageExt = /^jpg|jpeg|png|gif|bmp$/,
						file = options.resource.match(reFileName),
						extension = file[2],
						isImage = reImageExt.test(extension);
							
						console.log(file[2], isImage);
						
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

							$("#"+_resourceId).attr("src", options.resource + "?timestamp=" + tstamp );						
					}
			
			},
				
			ping: function( ) {
				
				var t = new Date(),
				    tstamp = t.getTime();
				
				// ping the server to keep alive
		    	// thanks to Jake Opines
				// http://www.atalasoft.com/cs/blogs/jake/archive/2008/12/19/creating-a-simple-ajax-sessionTimeout.aspx	    
		        // see http://docs.jquery.com/Release:jQuery_1.2/Internals for unique ids			        
					
				// if plugin was not initialized throw an error
				if(typeof _sessionTimeout === "undefined")
				{
					$.error('Initialize $.fn.sessionTimeout before invoking "ping".');
					return;
				}
				
				methods._fetch.apply();
				
				// if autoping is true, re-initialize the sessionTimeout
				// when autoping is true 
				if( options.autoping === true ){
					//methods.destroy.apply( this, arguments);
					methods._init.apply( this, arguments); 
			    }
			    			
				logEvent("$.fn.sessionTimeout status: session restarted @ " + t.toTimeString());
				$(document).trigger("ping.sessionTimeout");
		
			},
	    	
	    	durration : function( ) {
	    
				logEvent("$.fn.sessionTimeout status: durration " + options.timeout);
		
	    		return options.timeout;
	    	},
	    	
	    	elapsed : function( ) {
				var d = new Date() - _ready;
				
				logEvent("$.fn.sessionTimeout status: elapsed " + d + " ms");
		
				return d;   	
	    	}, 
	    	
	    	remaining : function ( ) {
	    		var currentTime = new Date(),
	    		    expiresTime = new Date(_ready.getTime() + options.timeout),
	    			// time until session expires in ms
	    			// use 0 if no time session has already expired
	    			remainingTime = (expiresTime - currentTime) > 0 ? expiresTime - currentTime : 0;
	    			logEvent("$.fn.sessionTimeout status: remaining " + remainingTime+ " ms");
	    			
	    		return remainingTime;
	    	
	    	},
	
	    	destroy : function( ) {	    	   
	    		try {
	    			window.clearTimeout(_sessionTimeout);
	    			window.clearTimeout(_beforeTimeout);
					delete _sessionTimeout;
					delete _beforeTimeout;

				} 
				catch(error) {
					$.error("Could not destroy, initialize the plugin before calling destroy.");
				}
				finally {
					
					logEvent("$.fn.sessionTimeout status: destroy");
					
					$(document).trigger("destroy.sessionTimeout");
	    	
	    			// unbind all sessionTimeout events
	    			$(document).unbind("sessionTimeout");
	    			
	    			// remove ping image from DOM
	    			$("#"+_resourceId).remove();
	    			delete _resourceId;
					delete _log;
					delete	$global;
					delete _log.length;
					delete _start;
					delete _version;
					delete _sessionTimeout;
					
					
				}				
			},
			
			printLog : function( ) {
				// returns an array of all logged events
				return _log;	
	    	
	    	}
		};
	
	
	
		
		
		// if the user specified an option which is also
		// a method then copy the options into the methods
		// this allow directly invoking a method like so 
		// $.fn.sessionTimeout("destroy");
		if(methods[options]) {
			method = options;
		} 
		
		// set the options
		//options = $.extend(defaults, options);
		// thanks @ssoper	
		$.extend($global, options);
		options = $.extend(defaults, $global);
		
				
		
					
		// Method calling logic
	    if ( methods[method] ) {
	      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      return methods._init.apply( this, arguments );
	    } else {
	      $.error( 'Method ' +  method + ' does not exist on jQuery.sessionTimeout' );
	    }   
	    
	    
	    // log event records events into an array
	    // it also prints events to the console if it
	    // is available
	    // *note log event must occur before triggering the bindings
	 	function logEvent ( str ) {
	 		_log.push(str);
	 	}
	 

	};
	
})(jQuery);