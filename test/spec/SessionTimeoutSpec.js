/*global describe: true, it: true, should: true, beforeEach: true, runs: true, expect: true, waits: true */

// describe('panda',function(){
//   it('is happy',function(){
//     expect(panda).toBe('happy');
//   });
// });

describe('jQuery.fn.sessionTimeout',function(){ 

 var createEvent = 0,
     destroyEvent = 0,
     args = false,
     version,
     strPing,
     destroyed = false,
     timeoutCalled = false,
     beforetimeoutCalled = false;
 

    beforeEach(function(){
        
        $(document).bind('create.sessionTimeout', function(event, args){
            version = args;
            createEvent ++;
        });
        
        $(document).bind('destroy.sessionTimeout', function(event, args){
            destroyEvent ++;
        });

        $(document).bind('ping.sessionTimeout', function() {                
            var t = new Date();
                strPing = "Session Restarted @ " + t.toTimeString(); 
        });

        $.fn.sessionTimeout({
            timeout: 20,
            promptfor: 10,
            resource: "../src/spacer.gif"
        }); 

    });

    afterEach(function(){
        $.fn.sessionTimeout('destroy');
        $(document).unbind('.sessionTimeout');
    });

    describe('The sessionTimeout plugin', function(){
        it('Should exist on the "fn" object as function', function(){
            expect($.isFunction($.fn.sessionTimeout)).toBe(true);
        });
    });
    
    describe('Options',function(){ 
        // autoping : true, // automaticaly ping the server to keep sessions alive
        // enableidletimer : true, // allows session control via idletimer plugin if present
        // timeout : 300000, // set the servers session timeout
        // resource : "spacer.gif", // set the asset to load from the server
        // promptfor : 10000, // triggers beforetimeout x seconds before session timeout
        // beforetimeout : $.noop, // callback which occurs prior to session timeout
        // pollactivity : 1000 // number seconds between checking for user activity (only needed if using idletimer)
    
        describe('Setting an ontimeout callback function', function(){
            it('Should invoke a callback when the time session time remaing is 0', function(){
                var remaining = 1;
                $.fn.sessionTimeout('destroy');
                $.fn.sessionTimeout(
                    {   
                        timeout: 50,
                        promptfor: 0,
                        resource: "../src/spacer.gif",
                        ontimeout: function(){
                            remaining = $.fn.sessionTimeout('remaining');
                            expect(remaining).toEqual(0);
                        }
                    }); 
            });
            it('Should invoke a callback function when session times out', function(){
                $.fn.sessionTimeout('destroy');
                $.fn.sessionTimeout(
                    {   
                        timeout: 50,
                        promptfor: 25,
                        resource: "../src/spacer.gif",
                        ontimeout: function(){
                            timeoutCalled = true;
                            expect(timeoutCalled).toBeTruthy();
                        }
                    }); 
            });
            it('Should raise an error if the callback is not a function', function(){

                // the plugin callback requires a function be passed in
                // to trigger an error this test passes in an invalid string
                // because jasmine .toThrow() has trouble handleing the error
                // thrown in th jquery plugin, we'll listen for the the window.error
                // event and pass it along to jamsine by rethrowing the error
                // we need to wait at least 170 ms or the test fails so we
                // should wait just a bit longer as a buffer.
                // there must be a better way to do this :( 

                $.fn.sessionTimeout('destroy');
                $.fn.sessionTimeout({   
                        timeout: 50,
                        promptfor: 25,
                        resource: "../src/spacer.gif",
                        ontimeout: "I'm not a function"
                    });
                
                var lasterr = $.noop;
                window.onerror=function(err){
                    lasterr = function(){  
                        return err;
                    }; 
                };
                
                waits(200);
                runs(function(){
                    expect(function(){
                           throw new Error(lasterr());
                    }).toThrow(new Error('Uncaught Error: The jQuery.sessionTimeout ontimeout parameter is expecting a function'));
                });

            });
        });
    }); 


    describe('Methods',function(){ 
        describe('$.fn.sessionTimeout("elapsed")', function(){
            it('Should return the time elapsed since session was started', function(){
                waits(10); // if you call elapsed without waiting 1ms you get 0
                runs(function(){
                    var elapsed = $.fn.sessionTimeout('elapsed');
                    expect(elapsed).toBeGreaterThan(0);                 
                });
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
        
        describe('$.fn.sessionTimeout("ping")', function(){
            it('Should load an uncached image from the server', function(){
                // demo using the 1px transparent gif included in the project
                $.fn.sessionTimeout("ping", {'resource':'src/spacer.gif'});
                expect(strPing).toBeTruthy();
            });

            it('Should load an uncached file from the server', function(){
                // demo a file resource using the project readme
                $.fn.sessionTimeout("ping", {resource:'README.md'});
            });
            
            it('Should trigger a ping.sessionTimeout jQuery event', function(){
                var pinged = false;
                
                $(document).bind("ping.sessionTimeout", function(){
                    expect(pinged).toBeTruthy();
                    return pinged = true;
                });

                $.fn.sessionTimeout({
                    timeout: 50,
                    promptfor: 25,
                    resource: "../src/spacer.gif"
                }); 
                
            });
        });

        describe('$.fn.sessionTimeout("printLog")', function(){
            it('Should return an array of logged plugin events', function(){
                var printLog = $.fn.sessionTimeout('printLog');
                $.fn.sessionTimeout('ping'); // do somthing that should be logged
                expect($.isArray(printLog)).toBeTruthy();
                expect(printLog.length).toBeGreaterThan(0);
            });
        });     

        describe('$.fn.sessionTimeout("destroy")', function(){

            it('Should reset elepase time', function(){
                $.fn.sessionTimeout({
                    timeout: 50,
                    ontimeout: $.noop,
                    promptfor: 25,
                    resource: "../src/spacer.gif"
                });
                //$.fn.sessionTimeout('destroy');
                //console.log($.fn.sessionTimeout('elapsed'));
                //expect($.fn.sessionTimeout('destroy')).toBeUndefined();
                //expect($.fn.sessionTimeout('elapsed')).toBeFalsy();
                //expect(isNaN($.fn.sessionTimeout('elapsed'))).toBeTruthy();
            });
            
            it('Should throw an error if "destroy" is called before plugin is initialized', function(){
                 $.fn.sessionTimeout({
                    timeout: 50,
                    ontimeout: $.noop,
                    promptfor: 25,
                    resource: "../src/spacer.gif"
                });
                 
                //var lasterr = $.noop;
                //window.onerror=function(err){
                //    lasterr = function(){  
                //        return err;
                //    }; 
                //};

               // $.fn.sessionTimeout('destroy');
               //  waits(200);
               //  runs(function(){

               //      expect(function(){

               //             //console.log(window.error);
               //             //throw new Error(lasterr());
               //      }).toThrow(new Error('Could not destroy, initialize the plugin before calling destroy.'));
               //  });

            });
        }); 

    });

    describe('Events',function(){ 
        describe('$(document).bind(\'create.sessionTimeout\');', function(){
            it('Should be triggered each time the plugin is initialized',function(){
                expect(createEvent).toBeGreaterThan(0);
                var last = createEvent;
                $.fn.sessionTimeout();
                expect( createEvent).toBe(last+1);
            });
            it('Should return the version number for the plugin',function(){
                expect(version).toBeTruthy();
            });
        });

        
        // describe('$(document).bind(\'destroy.sessionTimeout\');', function(){
        //     it('Should be triggered each time the plugin is destroyed', function(){
        //         expect(destroyEvent).toBeGreaterThan(0);
        //         var last = destroyEvent;
        //         $.fn.sessionTimeout('destroy');
        //         expect(destroyEvent).toBe(last+1);
        //     });
        // });

    });
});