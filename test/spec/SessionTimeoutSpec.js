/*global describe: true, it: true, should: true, beforeEach: true, runs: true, expect: true, waits: true */

// describe( 'panda' ,function(){
//   it( 'is happy' ,function(){
//     expect(panda).toBe( 'happy' );
//   });
// });
describe('If the jQuery sessionTimeout plugin is installed', function() {

    var createEvent = 0,
        destroyEvent = 0,
        promptEvent = 0,
        args = false,
        version, strPing, destroyed = false,
        timeoutCalled = false,
        beforetimeoutCalled = false,
        pageLoadTime = +new Date,
        onbeforetimeout, ontimeout, countDownStartTime = 0;


    beforeEach(function() {

        $(document).bind('create.sessionTimeout', function(event, args) {
            version = args;
            countDownStartTime = +new Date();
            createEvent++;
        });

        $(document).bind('prompt.sessionTimeout', function() {
            promptEvent++;
        });

        $(document).bind('destroy.sessionTimeout', function() {
            destroyEvent++;
        });

        $(document).bind('ping.sessionTimeout', function() {
            var t = new Date();
            strPing = "Session Restarted @ " + t.toTimeString();
        });

        $.fn.sessionTimeout({
            timeout: 20,
            promptfor: 10,
            resource: "../src/spacer.gif",
            beforetimeout: function() {
                onbeforetimeout = 'foo';
            },
            ontimeout: function() {
                ontimeout = 'bar';
            }
        });

    });

    afterEach(function() {
        $.fn.sessionTimeout('destroy');
    });

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
            var promptTime, expiredTime;

            $(document).on('prompt.sessionTimeout', function() {
                promptTime = +new Date;
            });
            $(document).on('expired.sessionTimeout', function() {
                expiredTime = +new Date;
            });
            waits(30); // for the session to expire
            runs(function() {
                expect(promptTime).toBeGreaterThan(0);
                expect(promptTime).toBeLessThan(expiredTime);
            });
        });

        it('it should trigger a callback function', function() {
            waits(30); // for the session to expire
            runs(function() {
                expect(onbeforetimeout).toBe('foo');
            });
        });
    });

    describe('when a session has expired', function() {
        it('it should fire a session expired event', function() {
            var promptTime, expiredTime;

            $(document).on('expired.sessionTimeout', function() {
                expiredTime = +new Date;
            });
            waits(30); // for the session to expire
            runs(function() {
                expect(expiredTime).toBeGreaterThan(0);
                expect(expiredTime).toBeLessThan(+new Date);
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


    describe('When the plugin is destroyed', function() {

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
        it('it should unbind all sessionTimeout events', function() {
            $.fn.sessionTimeout('destroy');
            expect($.data(document, 'events')).toBeUndefined();
        });
        it('it should throw an error if "destroy" is called before plugin is initialized', function() {

            var lasterr = $.noop;
            window.onerror = function(err) {
                lasterr = function() {
                    return err;
                };
            };
            $.fn.sessionTimeout('destroy');
            $.fn.sessionTimeout('destroy');
            waits(10);
            runs(function() {

                expect(function() {

                    console.log(window.error);
                    throw new Error(lasterr());
                }).toThrow(new Error('Could not destroy, initialize the plugin before calling destroy.'));
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

});