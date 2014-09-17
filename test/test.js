function assertStream(x) {
  return assert.ok(can.EventStream.isEventStream(x));
}

describe("can.eventstream", function() {
  describe("CanJS API", function() {
    describe("can.bind", function(){
      it("returns a stream if no callback is given", function() {
        assertStream(can.bind.call("body", "click"));
        assertStream(can.bind.call(can.$("body"), "click"));
        assertStream(can.bind.call(can.compute(), "what"));
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
            assertStream(this.on(new can.EventStream()));
          }
        });
        new MyControl(document.createElement("div"));
      });
      it("Only listens to events until the control has been destroyed yet", function() {
        var MyControl = can.Control.extend({}, {
          init: function() {
            this.baseStream = new can.EventStream();
            this.limitedStream = this.on(new can.EventStream());
          }
        });
        var ctrl = new MyControl(document.createElement("div"));
      });
    });
    describe("can.compute#bind", function(){
      it("returns a stream if no callback is given", function() {
        assertStream(can.compute().bind("change"));
      });
      it("triggers stream events with the new value when the compute changes", function(done) {
        var c = can.compute(),
            val = {};
        can.EventStream.onValue(c.bind("change"), function(e) {
          assert.ok(e);
          assert.equal(e, val);
          done();
        });
        c(val);
      });
      it("defaults to the 'change' event if no event name is given", function(done) {
        var c = can.compute(),
            val = {};
        can.EventStream.onValue(c.bind(), function(e) {
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
        can.EventStream.onValue(map.bind("change"), function(e) {
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
        can.EventStream.onValue(map.bind(), function(e) {
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
        can.EventStream.onValue(list.bind("change"), function(e) {
          var expected = {
            index: 0,
            how: "add",
            value: [2]
          };
          assert.ok(e.event && typeof e.event === "object");
          assert.equal(e.which, expected.which, "event.which");
          assert.equal(e.how, expected.how, "event.how");
          assert.deepEqual(e.value, expected.value, "event.value");
          called = true;
        });
        list.push(2);
        assert.ok(called, "Callback was invoked");
      });
      it("defaults to the 'change' event if no event name is given", function() {
        var list = new can.List(),
            called = false;
        can.EventStream.onValue(list.bind(), function(e) {
          assert.equal(e.how, "add");
          called = true;
        });
        list.push(2);
        assert.ok(called, "Callback was invoked");
      });
    });
    describe("can.bindComputeFromStream", function() {
      var parentCompute = can.compute(),
          stream = parentCompute.bind();
      it("returns a new compute if none is given", function() {
        assert.ok(can.bindComputeFromStream(stream).isComputed);
      });
      it("returns the passed-in compute if one is given", function() {
        var compute = can.compute();
        assert.equal(can.bindComputeFromStream(stream, compute), compute);
      });
      it("binds the returned compute to event stream values", function() {
        var compute1 = can.bindComputeFromStream(stream),
            compute2 = can.bindComputeFromStream(stream, can.compute());
        parentCompute("success");
        assert.equal(compute1(), parentCompute());
        assert.equal(compute2(), parentCompute());
      });
      it("supports two-way binding between computes", function() {
        var compute1 = can.compute(1),
            compute2 = can.compute(2);
        can.bindComputeFromStream(compute1.bind(), compute2);
        can.bindComputeFromStream(compute2.bind(), compute1);
        assert.equal(compute1(), 1);
        assert.equal(compute2(), 2);
        compute1(3);
        assert.equal(compute1(), 3);
        assert.equal(compute2(), 3);
        compute2(4);
        assert.equal(compute1(), 4);
        assert.equal(compute2(), 4);
      });
    });
    describe("can.bindMapFromStream", function() {
      it("returns a new map if none is given", function() {
        var stream = new can.EventStream;
        assert.ok(can.bindMapFromStream(stream) instanceof can.Map);
      });
      it("returns the passed-in map if one is given", function() {
        var parentMap = new can.Map(),
            stream = parentMap.bind(),
            map = new can.Map();
        assert.equal(can.bindMapFromStream(stream, map), map);
      });
      it("accepts change events returned by can.Map#bind", function() {
        var parentMap = new can.Map(),
            stream = parentMap.bind(),
            map = can.bindMapFromStream(stream);
        parentMap.attr("test", "success");
        assert.equal(map.attr("test"), parentMap.attr("test"));
        parentMap.attr("test", "success again");
        assert.equal(map.attr("test"), parentMap.attr("test"));
        parentMap.removeAttr("test");
        assert.ok(!map.attr().hasOwnProperty("test"));
      });
      it("supports two-way binding between can.Maps", function() {
        var map1 = new can.Map({x: 1}),
            map2 = new can.Map({y: 2});
        can.bindMapFromStream(map1.bind(), map2);
        can.bindMapFromStream(map2.bind(), map1);
        assert.deepEqual(map1.attr(), {x: 1});
        assert.deepEqual(map2.attr(), {y: 2});
        map1.attr("x", 2);
        assert.deepEqual(map1.attr(), {x: 2});
        assert.deepEqual(map2.attr(), {x: 2, y: 2});
        map2.attr("y", 1);
        assert.deepEqual(map1.attr(), {x: 2, y: 1});
        assert.deepEqual(map2.attr(), {x: 2, y: 1});
        map1.attr("x", "yay");
        assert.deepEqual(map1.attr(), {x: "yay", y: 1});
        assert.deepEqual(map2.attr(), {x: "yay", y: 1});
      });
      it("handles the 'add' event", function() {
        var stream = new can.EventStream(),
            map = can.bindMapFromStream(stream, new can.Map({y: 2}));
        stream.push({
          how: "add",
          which: "x",
          value: 1
        });
        assert.deepEqual(map.attr(), {x: 1, y: 2},
                         "Property is added if it didn't exist");
        stream.push({
          how: "add",
          which: "x",
          value: 2
        });
        assert.deepEqual(map.attr(), {x: 2, y: 2},
                         "Property is updated if it already existed");
      });
      it("handles the 'set' event", function() {
        var stream = new can.EventStream(),
            map = can.bindMapFromStream(stream, new can.Map({y: 2}));
        stream.push({
          how: "set",
          which: "x",
          value: 1
        });
        assert.deepEqual(map.attr(), {x: 1, y: 2},
                         "Property is added if it didn't exist");
        stream.push({
          how: "set",
          which: "x",
          value: 2
        });
        assert.deepEqual(map.attr(), {x: 2, y: 2},
                         "Property is updated if it already existed");
      });
      it("removes properties when the 'remove' event happens", function() {
        var stream = new can.EventStream(),
            map = can.bindMapFromStream(stream, new can.Map({x: 1}));
        stream.push({
          how: "remove",
          which: "x",
          value: 1
        });
        assert.deepEqual(map.attr(), {},
                         "Property is removed if it exists");
        stream.push({
          how: "remove",
          which: "x",
          value: 1
        });
        assert.deepEqual(map.attr(), {},
                         "Nothing happens if the property doesn't exist");
      });
      it("changes and adds properties a 'replace' event happens", function() {
        var stream = new can.EventStream(),
            map = can.bindMapFromStream(stream);
        map.attr("y", 2);
        stream.push({
          how: "replace",
          value: {x: 1},
          removeOthers: false
        });
        assert.deepEqual(map.attr(), {x: 1, y: 2});
      });
      it("Removes other properties if the removeOthers field is true", function() {
        var stream = new can.EventStream(),
            map = can.bindMapFromStream(stream);
        map.attr("y", 2);
        stream.push({
          how: "replace",
          value: {x: 1},
          removeOthers: true
        });
        assert.deepEqual(map.attr(), {x: 1});
      });
    });
    describe("can.bindListFromStream", function(){
      it("returns a new list if none is given", function() {
        var stream = new can.EventStream;
        assert.ok(can.bindListFromStream(stream) instanceof can.List);
      });
      it("returns the passed-in list if one is given", function() {
        var parentList = new can.List(),
            stream = parentList.bind(),
            list = new can.List();
        assert.equal(can.bindListFromStream(stream, list), list);
      });
      it("accepts change events returned by can.List#bind", function() {
        var parentList = new can.List(),
            stream = parentList.bind(),
            list = can.bindListFromStream(stream);
        parentList.attr("test", "success");
        assert.equal(list.attr("test"), parentList.attr("test"));
        parentList.attr("test", "success again");
        assert.equal(list.attr("test"), parentList.attr("test"));
        parentList.removeAttr("test");
        assert.ok(!list.attr().hasOwnProperty("test"));
      });
      it.skip("supports two-way binding between can.Lists", function() {
        // TODO - this isn't supported yet.
        var list1 = new can.List([1,2]),
            list2 = new can.List([3,4]);
        can.bindListFromStream(list1.bind(), list2);
        can.bindListFromStream(list2.bind(), list1);
        assert.deepEqual(list1.attr(), [1,2]);
        assert.deepEqual(list2.attr(), [3,4]);
        list1.attr(0, 5);
        assert.deepEqual(list1.attr(), [5,2]);
        assert.deepEqual(list2.attr(), [5,4]);
        list2.attr(2, 6);
        assert.deepEqual(list1.attr(), [5,2,6]);
        assert.deepEqual(list2.attr(), [5,4,6]);
        list1.attr("x", "yay");
        assert.deepEqual(list1.attr("x"), "yay");
        assert.deepEqual(list2.attr("x"), "yay");
      });
      it("handles the 'add' event", function() {
        var stream = new can.EventStream(),
            list = can.bindListFromStream(stream, new can.List([1]));
        stream.push({
          how: "add",
          index: 1,
          value: 2
        });
        assert.deepEqual(list.attr(), [1,2],
                         "Index is added if it didn't exist");
        stream.push({
          how: "add",
          index: 1,
          value: 3
        });
        assert.deepEqual(list.attr(), [1,3,2],
                         "Item is spliced into the index if it already existed");
      });
      it("handles the 'set' event", function() {
        var stream = new can.EventStream(),
            list = can.bindListFromStream(stream, new can.List([1]));
        stream.push({
          how: "set",
          index: 1,
          value: 2
        });
        assert.deepEqual(list.attr(), [1,2],
                         "Index is added if it didn't exist");
        stream.push({
          how: "set",
          index: 1,
          value: 3
        });
        assert.deepEqual(list.attr(), [1,3],
                         "Index is updated if it already existed");
      });
      it("removes indices when the 'remove' event happens", function() {
        var stream = new can.EventStream(),
            list = can.bindListFromStream(stream, new can.List([1,2]));
        stream.push({
          how: "remove",
          index: 1,
          value: [1]
        });
        assert.deepEqual(list.attr(), [1],
                         "Index is removed if it exists");
        stream.push({
          how: "remove",
          index: 1,
          value: [1]
        });
        assert.deepEqual(list.attr(), [1],
                         "Nothing happens if the index doesn't exist");
      });
      it("changes and adds indices a 'replace' event happens", function() {
        var stream = new can.EventStream(),
            list = can.bindListFromStream(stream, new can.List([1,2,3,4]));
        stream.push({
          how: "replace",
          value: [5,6],
          removeOthers: false
        });
        assert.deepEqual(list.attr(), [5,6,3,4]);
      });
      it("Removes other indices if the removeOthers field is true", function() {
        var stream = new can.EventStream(),
            list = can.bindMapFromStream(stream, new can.List([1,2,3,4]));
        stream.push({
          how: "replace",
          value: [5,6],
          removeOthers: true
        });
        assert.deepEqual(list.attr(), [5,6]);
      });
    });
  });
});
