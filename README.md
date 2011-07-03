sessionTimeout Query Plugin v0.0.2
Copyright (c) 2011 Asa Baylus. Licensed under MIT license.

## Overview

A jQuery plugin which prevents the users sessions from being abandoned by the server

By default the plugin will automatically ping the server every 30 minuets.
If Paul Irish's inactivity timer plugin is installed, the server will be pinged after 30 minuets of user inactivity.
If the inactivity plugin is installed but auto ping is disabled then when the user has been inactive the session will expire and an alternative interface may be presented.

Features include:

* jQuery-style instantiation
* jQuery-style event handling
* automatic session renewal
* on-demand session renewal
* logging of plugin events

## Usage

The sessionTimeout plugin is called as a jQuery utility function

```js
// automatically renew the users session every 30 minuets by default
$.fn.sessionTimeout();
```

Pass options into the plugin as an object. The following sample will display a JavaScript 
alert message 10 seconds before the user session expires. This sample also configures the 
session duration to last 30 seconds (30,000 ms). 

```js
jQuery(document).ready(function(){
    $.fn.sessionTimeout({
        timeout : 30000,
        promptfor : 10000,
        beforetimeout : function(){ 
            alert("do something!");
        } 
    }); 
});
```

Automatically renew the user session every 30 seconds

```js
jQuery(document).ready(function(){
    $.fn.sessionTimeout({
        autoping: true,
        timeout : 30000
    }); 
});
```

## Options

* autoping: true (boolean) : automaticaly continues the users session
* timeout:  when the session will timeout
* resource: "spacer.jpg" : url to an image or webpage (aspx, php, cfm, jsp, etc.) URL
* promptfor: number of ms to prompt user
* beforetimeout: function callback when the prompt begins 
* ontimeout: function callback when the session expires


## Methods

```js
$.fn.sessionTimeout("printLog"); // returns an array of logged plugin events
$.fn.sessionTimeout("ping"); // loads the uncahcable image specified in the Options img from the server 
$.fn.sessionTimeout("durration"); // returns servers durration in ms 
$.fn.sessionTimeout("elapsed"); // returns time session has been open in ms 
$.fn.sessionTimeout("remaining"); // returns time left until session expires in ms
$.fn.sessionTimeout("destroy"); // removes the plugin from the page and cleans up referneces
```


## Events


```js
$(document).bind("create.sessionTimeout", function(event, version));
$(document).bind("ping.sessionTimeout");
$(document).bind("prompt.sessionTimeout");
$(document).bind("destroy.sessionTimeout");
$(document).bind("expired.sessionTimeout");
$(document).bind("logEvent.sessionTimeout");
```

For example usage view examples/demo.html
For unit tests view test/index.html