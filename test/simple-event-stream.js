can.EventStream = function() {
  this.callbacks = [];
};

can.EventStream.prototype.push = function(val) {
  this.callbacks.forEach(function(cb) { cb(val); });
};

can.EventStream.isEventStream = function(stream) {
  return stream instanceof can.EventStream;
};
can.EventStream.onValue = function(stream, callback) {
  stream.callbacks.push(callback);
  return function() {
    var index = stream.callbacks.indexOf(callback);
    if (~index) { stream.callbacks.splice(index, 1); }
  };
};
can.EventStream.bind = function(ctx, ev, selector) {
  var stream = new can.EventStream();
  function callback() {
    stream.push(chooseEventData(ctx, arguments, ev));
  }
  if (selector) {
    can.delegate.call(ctx, selector, ev, callback);
  } else {
    can.bind.call(ctx, ev, callback);
  }
  return stream;
};
can.EventStream.untilStream = function(stream, until) {
  var newStream = new can.EventStream();
  can.EventStream.onValue(stream, function(data) {
    newStream.push(data);
  });
  can.EventStream.onValue(until, function() {
    newStream.callbacks = [];
  });
  return newStream;
};

function chooseEventData(ctx, eventArgs, evName) {
  if (ctx.isComputed) {
    return eventArgs[1];
  } else if (ctx.getEventValueForStream) {
    return ctx.getEventValueForStream(eventArgs, evName);
  } else {
    return eventArgs[0];
  }
}
