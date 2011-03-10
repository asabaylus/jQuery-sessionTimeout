sessionTimeout Query Plugin v0.0.1
-------------------------------
Copyright (c) 2011 Asa Baylus. Licensed under the MIT license.
 

Overview
--------

A jQuery plugin which prevents the users sessions from being abandoned by the server 

Features include:
	- jQuery-style instantiation
	- jQuery-style event handling
	- automatic session renewal
	- on-demand session renewal
	- logging of plugin events
	

Usage
-----
The sessionTimeout plugin is called as a jQuery utility function

// automatically renew the users session every 30 minuets
$.fn.sessionTimeout();


Options
-----

autoping: true (boolean) : automaticaly continues the users session
timeout:  when the session will timeout
img: url to an image URL
promptfor: number of ms to prompt user
beforetimeout: function callback when the prompt begins 
ontimeout: function callback when the session expires


Methods
-----
$.fn.sessionTimeout("printLog"); // returns an array of logged plugin events
$.fn.sessionTimeout("ping"); // loads the uncahcable image specified in the Options img from the server 
$.fn.sessionTimeout("durration"); // returns servers durration in ms (note this setting cannot be automatically determined from the server)
$.fn.sessionTimeout("elapsed"); // returns time session has been open in ms 
$.fn.sessionTimeout("remaining"); // returns time left until session expires in ms
$.fn.sessionTimeout("destroy"); // removes the plugin from the page and cleans up referneces



Events
-----
$.fn.sessionTimeout("create.sessionTimeout", function(event, version));
$.fn.sessionTimeout("ping.sessionTimeout");
$.fn.sessionTimeout("prompt.sessionTimeout");
$.fn.sessionTimeout("destroy.sessionTimeout");
$.fn.sessionTimeout("expired.sessionTimeout");


For example usage view examples/demo.html
For unit tests view test/index.html