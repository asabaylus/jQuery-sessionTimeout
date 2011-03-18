sessionTimeout Query Plugin v0.0.1
-------------------------------
Copyright (c) 2011 Asa Baylus. Licensed under the MIT license.
 

Overview
--------

Session Timeout is a jQuery plugin which provides an interface for preventing users sessions from being abandoned by the server. The plugin works by fetching a resource from the target server which host the user sessions. Session timeout can  retrieve and inject an image (typically a 1x1 px clear gif) into the current web page, in effect loading a resource from a server should renew the session. Alternatively, some servers (IIS, Apache) do not renew users sessions based on the requests for static assets. So optionally, the session timeout can be configured to download a file (php, aspx, cfm, fsp, etc.) into an invisible iframe. The file loaded into the iframe may then force the target server to renew the user's session. The session timeout plugin is strictly javascript and does not provide backend session reset scripts. 
   
Note that this plugin will not persist the users data after the session has expired. In fact, the script simply fetches a resource from the target application server, in effect it "pings" the server to keep the users session alive. However once the session has expired all user entered data will be lost. The plugin is intended to present users with some visual clues as to whats happened; and why everything they (the user) has been entering in a form is about to be lost.

Features include:
* jQuery-style instantiation
* jQuery-style event handling
* automatic session renewal
* on-demand session renewal
* logging of plugin events
	

Usage
-----
The sessionTimeout plugin is called as a jQuery utility function

// automatically renew the users session every 30 minuets
$.fn.sessionTimeout();


Options
-----

autoping: true (boolean) : automaticaly continues the users session
timeout:  when the session will timeout
resource: url to an image URL
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