/*global jasmine: true, afterEach: true, describe: true, it: true, beforeEach: true, runs: true, expect: true, waits: true */

var createEvent = 0,
    destroyEvent = 0,
    promptEvent = 0,
    promptTime = 0,
    expiredTime = 0,
    expiredEvent = 0,
    countDownStartTime = 0,
    onpromptCallback = jasmine.createSpy('onpromptCallback'),
    ontimeoutCallback  = jasmine.createSpy('ontimeoutCallback'),
    onCountdownStartEvent = jasmine.createSpy('oncountdownstartEvent'),
    onpromptEvent = jasmine.createSpy('onpromptEvent'),
    ontimeoutEvent = jasmine.createSpy('ontimeoutEvent'),
    onpingEvent = jasmine.createSpy('onpingEvent');


beforeEach(function(){


    $(document).on('create.sessionTimeout', function( ) {
        countDownStartTime = +new Date();
        createEvent++;
    });


    $(document).on('startCountdown.sessionTimeout', function() {
        onCountdownStartEvent();
    });

    $(document).on('prompt.sessionTimeout', function() {
        promptTime = +new Date();
        promptEvent++;
        onpromptEvent();
    });

    $(document).on('destroy.sessionTimeout', function() {
        destroyEvent++;
    });

    $(document).on('ping.sessionTimeout', function() {
        onpingEvent();
    });

    $(document).on('expired.sessionTimeout', function() {
        expiredTime = +new Date();
        expiredEvent++;
        ontimeoutEvent();
    });

    jasmine.Clock.useMock();

    $.fn.sessionTimeout({
        timeout: 20,
        promptfor: 10,
        enableidletimer: false,
        resource: "../src/spacer.gif",
        onprompt: function() {
            onpromptCallback();
        },
        ontimeout: function() {
            ontimeoutCallback();
        }
    });
});

afterEach(function() {
    $.fn.sessionTimeout('destroy');
});

describe('If the jQuery sessionTimeout plugin is installed', function() {

    it('it should exist on jQuery\'s "fn" object as function', function() {
        expect($.isFunction($.fn.sessionTimeout)).toBe(true);
    });

    it('it should return the plugin\'s version number', function() {
        var v = $.fn.sessionTimeout('version');
        expect( v ).toBe('0.0.2');
    });

    it('it should bind its events to the document', function(){
        expect($.data(document, 'events')).toBeDefined();
    });

    describe('when the prompt duration is longer than the session timeout', function(){
        it('it should raise an error', function(){
            expect(function(){

                    $.fn.sessionTimeout({
                        timeout: 1,
                        promptfor: 2
                    });

            }).toThrow('jquery.sessionTimeout: configuration error, promptfor must be less than timeout');
        });
    });

    describe('when a session countdown starts', function() {
        it('it should trigger a startCountdown event', function(){
            expect( onCountdownStartEvent.callCount ).toBeGreaterThan(0);
        });
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
            expect(onpingEvent).toHaveBeenCalled();
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
                'resource': '../src/spacer.gif'
            });
            expect($.fn.sessionTimeout('getResourceLoaded')).toBeDefined();
        });

        describe('and the resource is not an image', function(){
            it('it should load the resource in an iframe tag', function(){
                var targetEl;

                $.fn.sessionTimeout("ping", {
                    resource: 'README.md'
                });

                targetEl = $.fn.sessionTimeout("getResourceLoaded");

                expect( targetEl.prop("tagName") ).toBe( "IFRAME" );

            });
        });


        describe('and the resource is an image', function(){
            it('it should load the resource in an img tag', function(){
                var targetEl;

                $.fn.sessionTimeout('destroy');

                $.fn.sessionTimeout("ping", {
                    resource: '../src/spacer.gif'
                });

                targetEl = $.fn.sessionTimeout("getResourceLoaded");

                expect( targetEl.prop("tagName") ).toBe( "IMG" );
            });
        });

    });

    describe('when a session is about to expire', function() {
        it('it should fire a session prompt event before the session expires', function() {
            jasmine.Clock.tick( 10 );
            expect( onpromptEvent ).toHaveBeenCalled( );
            expect( ontimeoutEvent ).not.toHaveBeenCalled( );
        });

        it('it should trigger a callback function', function() {
            jasmine.Clock.tick( 10 );
            expect( onpromptCallback ).toHaveBeenCalled( );
            expect( ontimeoutCallback ).not.toHaveBeenCalled( );
        });
    });

    describe('when a session has expired', function() {
        it('it should fire a session expired event', function() {
            var lastCount = ontimeoutEvent.callCount;

            jasmine.Clock.tick( 30 );

            expect( expiredTime ).toBeGreaterThan( 0 );
            expect( ontimeoutEvent.callCount ).toBeGreaterThan( lastCount );
            expect( ontimeoutEvent ).toHaveBeenCalled( );
        });

        it('it should tigger a callback function', function() {

            jasmine.Clock.tick( 30 );

            expect( ontimeoutCallback ).toHaveBeenCalled( );
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
                    var returnedDataType = typeof elapsed;
                    expect(returnedDataType).toEqual('number');
                    expect(elapsed).toBeGreaterThan(before);
                });
            });
        });
        it('the time returned should fall within 10 ms of the session start time', function() {
            var sessionStartTime = $.fn.sessionTimeout('getStartTime');
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
            var sessionEndTime = $.fn.sessionTimeout('getEndTime'),
                remaining = $.fn.sessionTimeout('remaining'),
                now = +new Date();

            expect(remaining).toBeLessThan((sessionEndTime - now) + 5);
            expect(remaining).toBeGreaterThan((sessionEndTime - now) - 5);
        });
    });

    describe('when the plugin requests the sessions duration', function() {
        it('it should return the overall time for the session', function() {
            expect($.fn.sessionTimeout('duration')).toEqual(20);
        });
    });

    describe('get the keepAlive javascript timer object', function(){
        it('it should return the session keepAlive timer', function(){
            var timerid = $.fn.sessionTimeout('getKeepAliveTimer');
            expect( timerid ).toBeGreaterThan( 0 );

        });
    });

    describe('when the plugin is destroyed', function() {

        it('it should emit a "destroy" event', function() {
            var last = destroyEvent;
            $.fn.sessionTimeout('destroy');
            expect(destroyEvent).toBe(last + 1);
        });

        it('it should reset elepase time', function() {
            $.fn.sessionTimeout('destroy');
            expect($.fn.sessionTimeout('elapsed')).toBeUndefined();
        });

        it('it should reset remaing time', function() {
            $.fn.sessionTimeout('destroy');
            expect($.fn.sessionTimeout('remaining')).toBeUndefined();
        });

        it('it should cleanup the dom', function(){

            var targetEl, targetElAgain;

            $.fn.sessionTimeout("ping", {
                resource: '../src/spacer.gif'
            });

            targetEl = $.fn.sessionTimeout("getResourceLoaded");

            // confirm that an image resource loaded
            expect( targetEl.length ).toBeTruthy( );

            $.fn.sessionTimeout('destroy');

            targetElAgain = $.fn.sessionTimeout("getResourceLoaded");

            // confirm that an image resource was unloaded
            expect( targetElAgain ).toBeUndefined( );

        });

        it('it should not continue to run', function(){

            ontimeoutCallback.reset();

            // First time throught the timeout should fire
            jasmine.Clock.tick(20);
            expect(ontimeoutCallback).toHaveBeenCalled();

            $.fn.sessionTimeout('destroy');

            // After the pluing is detroyed it should not fire again
            jasmine.Clock.tick(20);
            expect( ontimeoutCallback.callCount ).toBe( 1 );
        });

        it('it should unbind all sessionTimeout events', function() {
            $.fn.sessionTimeout('destroy');
            expect($.data(document, 'events')).toBeUndefined();
        });

        it('it should able to reinitialze after being destroyed', function(){

            ontimeoutCallback.reset();

            // 1st timeout
            jasmine.Clock.tick(20);
            expect(ontimeoutCallback).toHaveBeenCalled();


            $.fn.sessionTimeout('destroy');

            // re-init the plugin
            $.fn.sessionTimeout({
                timeout: 20,
                promptfor: 10,
                enableidletimer: false,
                resource: '../src/spacer.gif',
                ontimeout: function() {
                    ontimeoutCallback();
                }
            });

            // 2nd call verifies plugin was initialized again
            jasmine.Clock.tick(20);
            expect( ontimeoutCallback.callCount ).toBe( 2 );
        });
    });

    describe('when the user\'s session is not configured to automatically renew', function(){

        it('it should not automatically renew the user\'s session', function(){

            $.fn.sessionTimeout({
                timeout: 10,
                resource: "../src/spacer.gif",
                autoping: false
            });

            waits( 20 );
            runs(function(){
                expect( onCountdownStartEvent ).toHaveBeenCalled( );
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

            jasmine.Clock.tick( 30 );
            expect( startCountdownCount ).toBeGreaterThan( 1 );
            $.fn.sessionTimeout('destroy');
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

            jasmine.Clock.tick( 30 );

            expect( pingCount ).toBeGreaterThan( 1 );
            $.fn.sessionTimeout('destroy');
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

                var lastCount = 0;

                $.fn.sessionTimeout({
                    timeout: 1,
                    promptfor: 0,
                    resource: "../src/spacer.gif",
                    autoping: true
                });


                jasmine.Clock.tick( 1 );


                lastCount = onCountdownStartEvent.callCount;
                $.fn.sessionTimeout('destroy');

                jasmine.Clock.tick( 1 );

                // the countstart event should stop firing
                expect( onCountdownStartEvent.callCount ).toEqual( lastCount );

            });
        });
    });

    describe( 'when the users session expires' , function(){
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
        it( 'it should invoke a callback function when the user is prompted' , function(){
            // option.onprompt
            jasmine.Clock.tick(20);
            expect( onpromptCallback ).toHaveBeenCalled();

        });
        it( 'it should invoke a callback function when session times out' , function(){
            // option.ontimeout
            jasmine.Clock.tick(20);
            expect( ontimeoutCallback ).toHaveBeenCalled();

        });
        it( 'it should raise an error if the callback is not a function' , function(){

            $.fn.sessionTimeout( 'destroy' );

            expect(function(){

                $.fn.sessionTimeout({
                    timeout: 20,
                    promptfor: 10,
                    enableidletimer: false,
                    resource: "../src/spacer.gif",
                    ontimeout: "I'm not a function"
                });

                jasmine.Clock.tick(20);

            }).toThrow('jquery.sessionTimeout: the ontimeout parameter is expecting a function');

        });
    });

});

describe('If the idelTimer plugin is configured to monitor user activity', function(){

    beforeEach(function(){

        $(document).on('expired.sessionTimeout', function() {
            expiredTime = +new Date();
        });


    });

    afterEach(function() {
        $.fn.sessionTimeout('destroy');
    });


    // describe('if the user is active', function(){
    //     it('it should renew the session before it times out', function(){});
    // });

    describe('when the activity polling duration is greater than the prompt duration', function(){
        it('it should raise an error', function(){
            // polling for user activity should occur more frequently then prompts.
            expect(function(){

                $.fn.sessionTimeout({
                    enableidletimer: true,
                    promptfor: 1,
                    pollactivity: 3
                });

            }).toThrow('jquery.sessionTimeout: configuration error, pollactivity must be less than promptfor if set');
        });
    });

    describe('if the user is not active the session should expire', function(){

        it('it should trigger a callback function', function() {
            jasmine.Clock.tick( 20 );
            expect(onpromptCallback).toHaveBeenCalled();
        });

        it('it should fire a session expired event', function() {

            jasmine.Clock.tick( 20 );
            expect( ontimeoutCallback ).toHaveBeenCalled();
            expect( expiredTime ).toBeGreaterThan( 0 );
            expect( expiredTime ).toBeLessThan( +new Date() );

        });

    });

});

// Taken from idle timer tests, this should be reworked for jasmine
// $.each( ["mousemove", "keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "touchmove"], function( i, event ) {
//         asyncTest( "Should clear timeout on " + event, function() {
//             expect( 3 );

//             var triggerEvent = function() {
//                 $( "#qunit-fixture" ).trigger( event );
//                 equal( $( "#qunit-fixture" ).data( "idleTimer" ), "active", "State should be active" );
//             };

//             // trigger event every now and then to prevent going inactive
//             setTimeout( triggerEvent, 100 );
//             setTimeout( triggerEvent, 200 );
//             setTimeout( triggerEvent, 300 );

//             setTimeout( function() {
//                 $.idleTimer( "destroy" );
//                 start();
//             }, 350);

//             $( "#qunit-fixture" ).idleTimer( 200 );
//         });
//     });
