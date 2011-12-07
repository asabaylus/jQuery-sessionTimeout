// describe('panda',function(){
//   it('is happy',function(){
//     expect(panda).toBe('happy');
//   });
// });

describe('jQuery.fn.sessionTimeout',function(){ 

	var createEvent = false,
		args = false,
		strPing,
		destroyed = false,
		timeoutCalled = false,
		beforetimeoutCalled = false;; 
 
 	beforeEach(function(){
 		
		$(document).bind('create.sessionTimeout', function(event, args){
			version = args;
			createEvent = true;
		});
		
		$(document).bind('ping.sessionTimeout', function() {				
			var t = new Date();
				strPing = "Session Restarted @ " + t.toTimeString(); 
		});

		$.fn.sessionTimeout(
			{
				
				timeout: 1000,
				promptfor: 500,
				resource: "../src/spacer.gif",
				beforetimeout: function(){
					console.log('befortimeout!');
					beforetimeoutCalled = true;
				},
				ontimeout: function(){
					console.log('ontimeout!');
					timeoutCalled = true;
				}
			});	

		

 	});
	
	describe('Options',function(){ 
  // 	   autoping : true, // automaticaly ping the server to keep sessions alive
  //       enableidletimer : true, // allows session control via idletimer plugin if present
  //       timeout : 300000, // set the servers session timeout
  //       resource : "spacer.gif", // set the asset to load from the server
  //       promptfor : 10000, // triggers beforetimeout x seconds before session timeout
  //       beforetimeout : $.noop, // callback which occurs prior to session timeout
  //       pollactivity : 1000 // number seconds between checking for user activity (only needed if using idletimer)
	
		describe('Setting an ontimeout callback which occurs upon session timeout', function(){
			it('Should invoke a callback function when session times out', function(){

				waits(1500);
				
				runs(function(){
					expect(timeoutCalled).toBeTruthy();
				});
				
			});

		});
	});	


	describe('Methods',function(){ 
		describe('$.fn.sessionTimeout("elapsed")', function(){
			it('Should return the time elapsed since session was started', function(){
				var elapsed = $.fn.sessionTimeout('elapsed');
				expect(elapsed).toBeGreaterThan(0);

			});	
		});

		describe('$.fn.sessionTimeout("duration")', function(){
			it('Should return the duration until session times out in ms', function(){
				var duration = $.fn.sessionTimeout('duration');
				expect(duration).toBeGreaterThan(0);
			});				
		});
	
		describe('$.fn.sessionTimeout("remaining")', function(){
			it('Should return the time remaining until session expires in ms', function(){
				var remaining = $.fn.sessionTimeout('remaining');
				expect(remaining).toBeGreaterThan(0);
			});
		});
		
		// describe('$.fn.sessionTimeout("ping")', function(){
		// 	it('Should load an uncached image from the server', function(){
		// 		// demo using the 1px transparent gif included in the project
		// 		$.fn.sessionTimeout("ping", {'resource':'src/spacer.gif'});
				
		// 	});
		// 	it('Should load an uncached file from the server', function(){
		// 		// demo a file resource using the project readme
		// 		$.fn.sessionTimeout("ping", {resource:'README.md'});
		// 	});
		// 	it('Should trigger a ping.sessionTimeout jQuery event', function(){
		// 		var pinged = false;
		// 		$(document).bind("ping.sessionTimeout", function(){
		// 			return pinged = true
		// 		});
		// 		expect(pinged).toBeTruthy();
		// 	});
		// });

		describe('$.fn.sessionTimeout("printLog")', function(){
			it('Should return an array of logged plugin events', function(){
				var printLog = $.fn.sessionTimeout('printLog');
				expect($.isArray(printLog)).toBeTruthy();
				expect(printLog.length).toBeGreaterThan(0);
			});
		});		

		describe('$.fn.sessionTimeout("destroy")', function(){
			it('Should remove the plugin from the page and cleans up references', function(){
				expect($.fn.sessionTimeout('destroy')).toBeUndefined();
			});
			
			it('Should throw an error if "destroy" is called before plugin is initialized', function(){
				$.fn.sessionTimeout('destroy'); // should be gone
				expect(function(){
					$.fn.sessionTimeout('destroy'); // should throw error
				}).toThrow();
			});
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


		it('Destroying the plugin should trigger the destroy event', function(){
			var destroyed = false;
			$(document).bind('destroy.sessionTimeout', function() {				
				destroyed = true;
			});	
			$.fn.sessionTimeout('destroy');
			expect(destroyed).toBeTruthy();
		});


	});
});