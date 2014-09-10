function assertStream(x) {
  return assert.ok(can.isEventStream(x));
}

describe("can.eventstream", function() {
  describe("CanJS API", function() {
    describe("can.bind", function(){
      it("returns a stream if no callback is given", function() {
        assertStream(can.bind.call(can.compute(), "what"));
        assertStream(can.bind.call("body", "click"));
        assertStream(can.bind.call($("body"), "click"));
        assertStream(can.bind.call(new can.Map(), "click"));
        assertStream(can.bind.call(new can.List(), "click"));
      });
      it("defaults to the 'change' event if no event name is given");
    });
    describe("can.delegate", function(){
      it("returns a stream if no callback is given", function() {
        assertStream(can.delegate.call("body", "div", "click"));
      });
      it("defaults to the 'change' event if no event name is given");
    });
    describe("can.Control#on", function(){
      it("returns an event stream if an event stream is passed in", function() {
        var MyControl = can.Control.extend({}, {
          init: function() {
            assertStream(this.on(new EventStream()));
          }
        });
        new MyControl($("<div>"));
      });
      it("Only listens to events as long as the control hasn't been destroyed yet");
    });
    describe("can.compute#bind", function(){
      it("returns a stream if no callback is given", function() {
        assertStream(can.compute().bind("change"));
      });
      it("triggers stream events with the new value when the compute changes", function(done) {
        var c = can.compute(),
            val = {};
        can.onEventStreamValue(c.bind("change"), function(e) {
          assert.ok(e);
          assert.equal(e, val);
          done();
        });
        c(val);
      });
      it("defaults to the 'change' event if no event name is given", function(done) {
        var c = can.compute(),
            val = {};
        can.onEventStreamValue(c.bind(), function(e) {
          assert.ok(e);
          assert.equal(e, val);
          done();
        });
        c(val);
      });
    });
    describe("can.Map#bind", function(){

      function assertMapChangeEvent(e, expected) {
        assert.ok(e.event && typeof e.event === "object");
        assert.equal(e.which, expected.which, "event.which");
        assert.equal(e.how, expected.how, "event.how");
        assert.equal(e.value, expected.value, "event.value");
      }

      it("returns a stream if no callback is given", function() {
        assertStream((new can.Map()).bind("change"));
      });
      it("returns correct event for 'change' event", function() {
        var map = new can.Map({x: 1}),
            called = false;
        can.onEventStreamValue(map.bind("change"), function(e) {
          assertMapChangeEvent(e, {
            which: "x",
            how: "set",
            value: 2
          });
          called = true;
        });
        map.attr("x", 2);
        assert.ok(called, "Callback was invoked");
      });
      it("defaults to the 'change' event if no event name is given", function() {
        var map = new can.Map({x: 1}),
            called = false;
        can.onEventStreamValue(map.bind(), function(e) {
          called = true;
        });
        map.attr("x", 2);
        assert.ok(called, "Callback was invoked");
      });
    });
    describe("can.List#bind", function(){
      function assertListChangeEvent(e, expected) {
      }
      it("returns a stream if no callback is given", function() {
        assertStream((new can.List([])).bind("change"));
      });
      it("returns correct event for 'change' event", function() {
        var list = new can.List(),
            called = false;
        can.onEventStreamValue(list.bind("change"), function(e) {
          var expected = {
            index: 0,
            how: "add",
            value: 2
          };
          assert.ok(e.event && typeof e.event === "object");
          assert.equal(e.which, expected.which, "event.which");
          assert.equal(e.how, expected.how, "event.how");
          assert.equal(e.value, expected.value, "event.value");
          called = true;
        });
        list.push(2);
        assert.ok(called, "Callback was invoked");
      });
      it("defaults to the 'change' event if no event name is given");
    });
    describe("can.bindComputeFromStream", function(){
    });
    describe("can.bindMapFromStream", function(){
    });
    describe("can.bindListFromStream", function(){
    });
  });
  describe("Plugin API", function() {
    describe("can.isEventStream", function(){
    });
    describe("can.onEventStreamValue", function(){
    });
    describe("can.bindEventStream", function(){
    });
    describe("#getEventValueForStream", function(){
    });
  });
});
