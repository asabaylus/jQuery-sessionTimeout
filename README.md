# jQuery Session Timeout

Prevents lost data due to session timeouts, by provivideing a user interface which alows users to refresh thier session before it expires

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/asabaylus/jquery.sessiontimeout.js/master/dist/jquery.sessiontimeout.min.js
[max]: https://raw.github.com/asabaylus/jquery.sessiontimeout.js/master/dist/jquery.sessiontimeout.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.sessiontimeout.min.js"></script>
<script>
jQuery(document).ready(function(){
    $.fn.sessionTimeout(); 
});
</script>
```

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

* autoping: true (boolean) : automatically continues the users session
* timeout:  when the session will timeout
* resource: "spacer.jpg" : url to an image or webpage (aspx, php, cfm, jsp, etc.) URL
* beforetimeout: function callback when the prompt begins. Once beforeTimeout has triggered the session expiration will occur unless the countdown is restarted by calling the ping method ex: $.fn.sessionTimeout('ping') 
* beforetimeout: function callback when the prompt begins 
* ontimeout: function callback when the session expires


## Methods

$.fn.sessionTimeout("ping"); // loads the uncachable image specified in the Options img from the server 
$.fn.sessionTimeout("printLog"); // returns an array of logged plugin events
$.fn.sessionTimeout("ping"); // loads the uncahcable image specified in the Options img from the server 
$.fn.sessionTimeout("destroy"); // removes the plugin from the page and cleans up references
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

## Examples
<a href="examples/demo.html">Basic Demo</a>
<a href="examples/jqueryui.html">Jquery UI Demo</a>

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Asa Baylus  
Licensed under the MIT, GPL licenses.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

### Important notes
Please don't edit files in the `dist` subdirectory as they are generated via grunt. You'll find source code in the `src` subdirectory!

While grunt can run the included unit tests via PhantomJS, this shouldn't be considered a substitute for the real thing. Please be sure to test the `test/*.html` unit test file(s) in _actual_ browsers.

### Installing grunt
_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Test that grunt is installed globally by running `grunt --version` at the command-line.
1. If grunt isn't installed globally, run `npm install -g grunt` to install the latest version. _You may need to run `sudo npm install -g grunt`._
1. From the root directory of this project, run `npm install` to install the project's dependencies.

### Installing PhantomJS

In order for the qunit task to work properly, [PhantomJS](http://www.phantomjs.org/) must be installed and in the system PATH (if you can run "phantomjs" at the command line, this task should work).

Unfortunately, PhantomJS cannot be installed automatically via npm or grunt, so you need to install it yourself. There are a number of ways to install PhantomJS.

* [PhantomJS and Mac OS X](http://ariya.ofilabs.com/2012/02/phantomjs-and-mac-os-x.html)
* [PhantomJS Installation](http://code.google.com/p/phantomjs/wiki/Installation) (PhantomJS wiki)

Note that the `phantomjs` executable needs to be in the system `PATH` for grunt to see it.

* [How to set the path and environment variables in Windows](http://www.computerhope.com/issues/ch000549.htm)
* [Where does $PATH get set in OS X 10.6 Snow Leopard?](http://superuser.com/questions/69130/where-does-path-get-set-in-os-x-10-6-snow-leopard)
* [How do I change the PATH variable in Linux](https://www.google.com/search?q=How+do+I+change+the+PATH+variable+in+Linux)
