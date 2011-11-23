$(document).ready(function(){  
  	
  	var createEvent = false,
  		args = false,
  		strPing,
  		destroyed = false;
  	
	$(document).bind('create.sessionTimeout', function(event, args){
		version = args;
		createEvent = true;
	});
	
	$(document).bind('ping.sessionTimeout', function() {				
		var t = new Date();
			strPing = "Session Restarted @ " + t.toTimeString(); 
	});


	$.fn.sessionTimeout({img: "../src/spacer.gif"});
	
	

	module('jQuery.fn.sessionTimeout Methods');

	test('Test elapsed method', function(){
		var elapsed = $.fn.sessionTimeout('elapsed');
		ok(elapsed, elapsed + ' ms elasped since session countdown started');
	});	

	test('Test duration method', function(){
		var duration = $.fn.sessionTimeout('duration');
		ok(duration, duration + ' ms long duration set for this session');
	});		

	test('Test remaining method', function(){
		var remaining = $.fn.sessionTimeout('remaining');
		ok(remaining, remaining + ' ms remaining to session timeout');
	});	
	

	module('jQuery.fn.sessionTimeout Events');

	test('Test create event',function(){
		ok($.isFunction($.fn.sessionTimeout), 'plugin namespace created');
		ok(createEvent, "create.sessionTimeout was triggered");
		ok(version, 'session Timeout version = ' + version);
	});
	
	test('Test ping event', function(){
		$.fn.sessionTimeout('ping');
		ok(strPing, 'ping.sessionTimeout was triggered @' + strPing);
	});	


	test('Test destroy event', function(){
		var destroyed = false;
		$(document).bind('destroy.sessionTimeout', function() {				
			destroyed = true;
		});	
		$.fn.sessionTimeout('destroy');
		console.log('after',$.isFunction($.fn.sessionTimeout));
		ok(destroyed, 'destroy.sessionTimeout event was triggered');
	});

	test('Test destroy event raises error if plugin not initialized', function(){
		raises(function(){
			$.fn.sessionTimeout('destroy'); // should be gone
			$.fn.sessionTimeout('destroy'); // should throw error
		}, 'Should throw error: Could not destroy, initialize the plugin before calling destroy.'
		);
	});
	
});