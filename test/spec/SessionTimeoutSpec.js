/*global describe: true, it: true, should: true, beforeEach: true, runs: true, expect: true, waits: true */

var createEvent = 0,
    destroyEvent = 0,
    promptEvent = 0,
    promptTime = 0,
    args = false,
    version, strPing, destroyed = false,
    timeoutCalled = false,
    beforetimeoutCalled = false,
    pageLoadTime = +new Date(),
    expiredTime = 0,
    expiredEvent = 0,
    onprompt, ontimeout, countDownStartTime = 0;

   beforeEach(function() {

        $(document).on('create.sessionTimeout', function(event, args) {
            version = args;
            countDownStartTime = +new Date();
            createEvent++;
        });

        $(document).on('prompt.sessionTimeout', function() {
            promptTime = +new Date();
            promptEvent++;
        });

        $(document).on('destroy.sessionTimeout', function() {
            destroyEvent++;
        });

        $(document).on('ping.sessionTimeout', function() {
            var t = new Date();
            strPing = "Session Restarted @ " + t.toTimeString();
        });

        $(document).on('expired.sessionTimeout', function() {
            expiredTime = +new Date();
            expiredEvent++;
        });

    });

    afterEach(function() {
        $.fn.sessionTimeout('destroy');
    });

describe('If the jQuery sessionTimeout plugin is installed', function() {

    beforeEach(function(){
        $.fn.sessionTimeout({
            timeout: 20,
            promptfor: 10,
            enableidletimer: false,
            resource: "../src/spacer.gif",
            onprompt: function() {
                onprompt = 'foo';
            },
            ontimeout: function() {
                ontimeout = 'bar';
            }
        });
    });

    // it('it should not permit the prompt durration to be longer than the session timeout', function(){

        // window.onerror=function(err){
        //     lasterr = function(){  
        //         return err;
        //     }; 
        // };
           
        // $.fn.sessionTimeout('destroy');
        // $.fn.sessionTimeout({
        //     timeout: 20,
        //     promptfor: 30
        // });  
        
        //console.log(lasterr())
                
        // expect(function(){
        //        throw new Error(lasterr());
        // }).toThrow(new Error( 'The configuration pollactivity is too long: polling must happen prior to the onprompt callback.' ));
        
    // });
 

    it('it should exist on jQuery\'s "fn" object as function', function() {
        expect($.isFunction($.fn.sessionTimeout)).toBe(true);
    });
    it('it should return the plugin\'s version number', function() {
        expect(version).toBe('0.0.2');
    });


    describe('when a session countdown starts', function() {
        it('it should fire a session created event', function() {
            expect(createEvent).toBeGreaterThan(0);
        });
        it('it should begin the session timeout countdown', function() {
            var remaining = $.fn.sessionTimeout('remaining');
            expect(remaining).toBeGreaterThan(0);
            waits(1);
            runs(function() {
                expect($.fn.sessionTimeout('remaining')).toBeLessThan(remaining);
            });
        });
        it('it should be triggered each time the plugin is initialized', function() {
            expect(createEvent).toBeGreaterThan(0);
            var last = createEvent;
            $.fn.sessionTimeout();
            expect(createEvent).toBe(last + 1);
        });
    });

    describe('when the ping method is called to renew the session', function() {
        it('it should emit a "ping" event', function() {
            $.fn.sessionTimeout("ping", {
                resource: 'README.md'
            });
            expect(strPing).toBeDefined();
        });
        it('it should reset the session countdown timer', function() {
            var timeRemaining, prevTimeRemaining;

            // let the clock tick down a little bit  first
            waits(5);
            runs(function() {
                // capture the ticked down time
                prevTimeRemaining = $.fn.sessionTimeout('remaining'); // 1 min
                // reset the countdown
                $.fn.sessionTimeout('ping', {
                    resource: 'README.md'
                });
                // dont wait just capture the time
                timeRemaining = $.fn.sessionTimeout('remaining');
                expect(timeRemaining).toBeGreaterThan(prevTimeRemaining);
            });

        });
        it('it should load a non image resource from the server by default', function() {
            // demo a file resource using the project readme
            $.fn.sessionTimeout("ping", {
                resource: 'README.md'
            });
            expect($.fn.sessionTimeout('getResourceLoaded')).toBeDefined();
        });
        it('it may optionaly load an image resource', function() {
            // demo using the 1px transparent gif included in the project
            $.fn.sessionTimeout('ping', {
                'resource': 'src/spacer.gif'
            });
            expect($.fn.sessionTimeout('getResourceLoaded')).toBeDefined();
        });
    });

    describe('when a session is about to expire', function() {
        it('it should fire a session prompt event before the session expires', function() {
            waits(30); // for the session to expire
            runs(function() {
                expect(promptTime).toBeGreaterThan(0);
                expect(promptTime).toBeLessThan(expiredTime);
            });
        });

        it('it should trigger a callback function', function() {
            waits(30); // for the session to expire
            runs(function() {
                expect(onprompt).toBe('foo');
            });
        });
    });

    describe('when a session has expired', function() {
        it('it should fire a session expired event', function() {
            var last = expiredEvent;

            waits(30); // for the session to expire
            runs(function() {
                expect(expiredTime).toBeGreaterThan( 0 );
                expect(expiredTime).toBeLessThan( +new Date() );
                expect(expiredEvent).toBe( last + 1 );
            });
        });

        it('it should tigger a callback function', function() {
            waits(20); // for the session to expire
            runs(function() {
                expect(ontimeout).toBe('bar');
            });
        });
    });

    describe('when the plugin requests elasped time', function() {
        it('it should return the time since the session countdown began', function() {
            var before;
            waits(5); // for a little time to elapse
            runs(function() {
                var elapsed = $.fn.sessionTimeout('elapsed');
                before = elapsed;
                waits(5);
                runs(function() {
                    var elapsed = $.fn.sessionTimeout('elapsed');
                    expect(elapsed).toBeGreaterThan(before);
                });
            });
        });
        it('the time returned should fall within 10 ms of the session start time', function() {
            var before, sessionStartTime = $.fn.sessionTimeout('getStartTime');
            waits(5); // for a little time to elapse
            runs(function() {
                var elapsed = $.fn.sessionTimeout('elapsed'),
                    now = +new Date();
                expect(elapsed).toBeLessThan((now - sessionStartTime) + 5);
                expect(elapsed).toBeGreaterThan((now - sessionStartTime) - 5);
            });
        });
    });

    describe('when the plugin requests remaining time', function() {
        it('it should return the time remaining until the session expires', function() {
            var before;

            waits(5); // for a little time to elapse
            runs(function() {
                var remaining = $.fn.sessionTimeout('remaining');
                before = remaining;
                waits(5);
                runs(function() {
                    var remaining = $.fn.sessionTimeout('remaining');
                    expect(remaining).toBeLessThan(before);
                });
            });
        });
        it('the time returned should fall within 10 ms of the session expiration time', function() {
            var before, sessionEndTime = $.fn.sessionTimeout('getEndTime'),
                remaining = $.fn.sessionTimeout('remaining'),
                now = +new Date();

            expect(remaining).toBeLessThan((sessionEndTime - now) + 5);
            expect(remaining).toBeGreaterThan((sessionEndTime - now) - 5);
        });
    });

    describe('when the plugin requests the sessions duration', function() {
        it('should return the overall time for the session', function() {
            expect($.fn.sessionTimeout('duration')).toEqual(20);
        });
    });

    describe('get the keepAlive javascript timer object', function(){
        it('should return the session keepAlive timer', function(){
            var timerid = $.fn.sessionTimeout('getKeepAliveTimer');
            expect( timerid ).toBeGreaterThan( 0 ); 

        })
    });

    describe('when the plugin is destroyed', function() {

        it('it should reset elepase time', function() {
            $.fn.sessionTimeout('destroy');
            expect($.fn.sessionTimeout('elapsed')).toBeUndefined();
        });

        it('it should reset remaing time', function() {
            $.fn.sessionTimeout('destroy');
            expect($.fn.sessionTimeout('remaining')).toBeUndefined();
        });

        it('it should emit a "destroy" event', function() {
            var last = destroyEvent;
            $.fn.sessionTimeout('destroy');
            expect(destroyEvent).toBe(last + 1);
        });
        it('it should unon all sessionTimeout events', function() {
            $.fn.sessionTimeout('destroy');
            expect($.data(document, 'events')).toBeUndefined();
        });
    });

    describe('when the user\'s session is not configured to automatically renew', function(){

        it('it should not automatically renew the user\'s session', function(){
            var startCountdownCount = 0;
            
            $(document).on('startCountdown.sessionTimeout', function() {
                startCountdownCount++;
            });  

            $.fn.sessionTimeout({
                timeout: 10,
                resource: "../src/spacer.gif",
                autoping: false
            });

            waits( 20 );
            runs(function(){
                expect( startCountdownCount ).toEqual( 1 );            
                $.fn.sessionTimeout('destroy');
            });
        });
    });

    describe('when the user\'s session is configured to automatically renew', function(){

        it('it should restart the countdown automatically', function(){
            var startCountdownCount = 0;
            
            $(document).on('startCountdown.sessionTimeout', function() {
                    startCountdownCount++;
            });  

            $.fn.sessionTimeout({
                timeout: 20,
                resource: "../src/spacer.gif",
                autoping: true
            });

            waits( 30 );
            runs(function(){
                expect( startCountdownCount ).toBeGreaterThan( 1 );            
                $.fn.sessionTimeout('destroy');
            });
        });

        it('it should not allow the user\'s session to time-out', function(){
            var callbackCount = 0;

            $.fn.sessionTimeout({
                timeout: 20,
                promptfor: 10,
                resource: "../src/spacer.gif",
                ontimeout: function() {
                    callbackCount ++;                
                },
                autoping: true
            });

            waits( 30 );
            runs(function(){
                expect( callbackCount ).toEqual( 0 );
                $.fn.sessionTimeout('destroy');
            });
        });

        it('it should ping the server to renew the session', function(){
            var pingCount = 0;

            $(document).on('ping.sessionTimeout', function() {
                    pingCount++;
            });  
            
            $.fn.sessionTimeout({
                timeout: 10,
                resource: "../src/spacer.gif",
                autoping: true
            });

            waits( 30 );
            runs(function(){
                expect( pingCount ).toBeGreaterThan( 1 );
                $.fn.sessionTimeout('destroy');
            });
        });

        it('it should not prompt the user to continue the session', function(){
            var callbackCount = 0,
                eventCount = 0;
            
            $(document).on('prompt.sessionTimeout', function() {
                    eventCount++;
            });

            $.fn.sessionTimeout({
                timeout: 20,
                promptfor: 10,
                resource: "../src/spacer.gif",
                onprompt: function() {
                    callbackCount ++;                
                },
                autoping: true
            });

            waits( 10 );
            runs(function(){
                // the onprompt callback should not fire
                expect( callbackCount ).toEqual( 0 );
                expect( eventCount ).toEqual( 0 );
                $.fn.sessionTimeout('destroy');
            });
        });

        describe('and the plugin is destroyed', function(){
            it('it should not automatically renew the user\'s session', function(){
                var startCountdownCount = 0;
                
                $(document).on('startCountdown.sessionTimeout', function() {
                    startCountdownCount++;                
                });  

                $.fn.sessionTimeout({
                    timeout: 1,
                    promptfor: 0,
                    resource: "../src/spacer.gif",
                    autoping: true
                });

                waits( 2 );
                runs(function(){      
                    $.fn.sessionTimeout('destroy');            
                });

                waits( 3 );
                runs(function(){
                    expect( startCountdownCount ).toEqual( 2 );             
                });
            });
        });
    });
});



describe('If the idelTimer plugin is configured to monitor user activity, then', function(){


        
        // describe('if the user is active', function(){
        //     it('it should renew the session before it times out', function(){});
        // });
        describe('if the user is not active the session should expire', function(){        

           
            beforeEach(function(){            

                $.fn.sessionTimeout({
                    enableidletimer: true,
                    autoping: false,
                    timeout: 10,
                    promptfor: 0,
                    resource: "../src/spacer.gif",
                    onprompt: function() {
                        onprompt = 'foo';
                    },
                    ontimeout: function() {
                        console.log('test');
                        ontimeout = 'bar';
                    }
                });

            });

            it('and it should tigger a callback function', function() {
                waits(10); // for the session to expire
                runs(function() {
                    expect(ontimeout).toBe('bar');
                });
            });
             
            it('and it should fire a session expired event', function() {
                var last = expiredEvent;

                waits(10); // for the session to expire
                runs(function() {
                    expect( expiredTime ).toBeGreaterThan( 0 );
                    expect( expiredTime ).toBeLessThan( +new Date() );
                    expect( expiredEvent ).toBe( last + 1 );
                });
            });

        });
});




    /*
    
    describe( 'Options' ,function(){ 
        // autoping : true, // automaticaly ping the server to keep sessions alive
        // enableidletimer : true, // allows session control via idletimer plugin if present
        // timeout : 300000, // set the servers session timeout
        // resource : "spacer.gif", // set the asset to load from the server
        // promptfor : 10000, // triggers beforetimeout x seconds before session timeout
        // beforetimeout : $.noop, // callback which occurs prior to session timeout
        // pollactivity : 1000 // number seconds between checking for user activity (only needed if using idletimer)
    
        describe( 'Setting an ontimeout callback function' , function(){
            it( 'it should invoke a callback when the time session time remaing is 0' , function(){
                var remaining = 1;
                $.fn.sessionTimeout( 'destroy' );
                $.fn.sessionTimeout(
                    {   
                        timeout: 50,
                        promptfor: 0,
                        resource: "../src/spacer.gif",
                        ontimeout: function(){
                            remaining = $.fn.sessionTimeout( 'remaining' );
                            expect(remaining).toEqual(0);
                        }
                    }); 
            });
            it( 'it should invoke a callback function when session times out' , function(){
                $.fn.sessionTimeout( 'destroy' );
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
            it( 'it should raise an error if the callback is not a function' , function(){

                // the plugin callback requires a function be passed in
                // to trigger an error this test passes in an invalid string
                // because jasmine .toThrow() has trouble handleing the error
                // thrown in th jquery plugin, we'll listen for the the window.error
                // event and pass it along to jamsine by rethrowing the error
                // we need to wait at least 170 ms or the test fails so we
                // should wait just a bit longer as a buffer.
                // there must be a better way to do this :( 

                $.fn.sessionTimeout( 'destroy' );
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
                
                waits( 200 );
                runs(function(){
                    expect(function(){
                           throw new Error(lasterr());
                    }).toThrow(new Error( 'Uncaught Error: The jQuery.sessionTimeout ontimeout parameter is expecting a function' ));
                });

            });
        });
    }); 


  
*/
