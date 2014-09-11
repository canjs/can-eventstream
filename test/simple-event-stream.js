function EventStream() {
  this.callbacks = [];
}

EventStream.prototype.push = function(val) {
  this.callbacks.forEach(function(cb) { cb(val); });
};

can.isEventStream = function(stream) {
  return stream instanceof EventStream;
};

can.onEventStreamValue = function(stream, callback) {
  stream.callbacks.push(callback);
};

can.bindEventStream = function(ctx, ev, selector) {
  var stream = new EventStream();
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

can.eventStreamUntil = function(stream, until) {
  var newStream = new EventStream();
  can.onEventStreamValue(stream, function(data) {
    newStream.push(data);
  });
  can.onEventStreamValue(until, function() {
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
