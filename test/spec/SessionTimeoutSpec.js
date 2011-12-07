// describe('panda',function(){
//   it('is happy',function(){
//     expect(panda).toBe('happy');
//   });
// });

describe('jQuery.fn.sessionTimeout',function(){ 

	var createEvent = false,
		args = false,
		strPing,
		destroyed = false; 
 
 	beforeEach(function(){
 		
		$(document).bind('create.sessionTimeout', function(event, args){
			version = args;
			createEvent = true;
		});
		
		$(document).bind('ping.sessionTimeout', function() {				
			var t = new Date();
				strPing = "Session Restarted @ " + t.toTimeString(); 
		});


		$.fn.sessionTimeout({img: "../src/spacer.gif"});

 	});
	
	


	describe('Methods',function(){ 
		describe('$.fn.sessionTimeout("elapsed")', function(){
			it('Should return the time elapsed since session was started', function(){
				var elapsed = $.fn.sessionTimeout('elapsed');
				expect(elapsed).toBeGreaterThan(0);

			});	
		});


		it('Should return the duration until session times out', function(){
			var duration = $.fn.sessionTimeout('duration');
			expect(duration).toBeTruthy();
		});		

		it('Should return the time remaining in the session', function(){
			var remaining = $.fn.sessionTimeout('remaining');
			expect(remaining).toBeTruthy();
		});
	});

	describe('Events',function(){ 
		it('Should instantiate the plugin',function(){
			expect($.isFunction($.fn.sessionTimeout)).toBeTruthy();
			expect(createEvent).toBeTruthy();
			expect(version).toBe('0.0.1');
		});
		
		it('Should ping the target server', function(){
			$.fn.sessionTimeout('ping');
			expect(strPing).toBeTruthy();
		});	


		it('Should remove the plugin', function(){
			var destroyed = false;
			$(document).bind('destroy.sessionTimeout', function() {				
				destroyed = true;
			});	
			$.fn.sessionTimeout('destroy');
			expect(destroyed).toBeTruthy();
		});

		it('Should throw an error if the the plugin is removed before it was created', function(){
			$.fn.sessionTimeout('destroy'); // should be gone
			expect(function(){
				$.fn.sessionTimeout('destroy'); // should throw error
			}).toThrow();
		});
	});
});