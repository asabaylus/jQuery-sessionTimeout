$(document).ready(function(){  
  	
  	var createEvent = false,
  		args = false,
  		strPing,
  		strDestroy;
  	
	$(document).bind('create.sessionTimeout', function(event, args){
		version = args;
		createEvent = true;
	});
	
	$(document).bind('ping.sessionTimeout', function() {				
		var t = new Date();
			strPing = "Session Restarted @ " + t.toTimeString(); 
	});

	$(document).bind('destroy.sessionTimeout', function() {				
		var t = new Date();
			strDestroy = "Session Restarted @ " + t.toTimeString(); 
	});	
	
	$.fn.sessionTimeout({img: "../src/spacer.gif"});
	
	
	module('jQuery.fn.sessionTimeout Events');

	test('Test create event',function(){
		ok(createEvent, "create.sessionTimeout was triggered");
		ok(version, 'session Timeout version = ' + version);
	});
	
	test('Test ping event', function(){
		$.fn.sessionTimeout('ping');
		ok(strPing, 'ping.sessionTimeout was triggered @' + strPing);
	});	
	
	test('Test destroy event', function(){
		$.fn.sessionTimeout();
		$.fn.sessionTimeout('destroy');
		ok(strDestroy, 'destroy.sessionTimeout event was triggered @' + strDestroy);
	});

	test('Test destroy event raises error if plugin not initialized', function(){
		$.fn.sessionTimeout('destroy');
		raises(function(){
			$.fn.sessionTimeout('destroy');
		}, 'Could not destroy, initialize the plugin before calling destroy.'
		);
	});
	
});