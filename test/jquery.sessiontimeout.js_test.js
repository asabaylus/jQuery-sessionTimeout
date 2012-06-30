/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  
  var createEvent = false,
    args = false,
    strPing,
    strDestroy,
    version;
    
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
      raises(function(){
        // calling destroy twice in a row should throw an error
        $.fn.sessionTimeout('destroy');
        $.fn.sessionTimeout('destroy');
      }, 'Could not destroy, initialize the plugin before calling destroy.'
      );
  });

}(jQuery));
