# can.eventstream

`can.eventstream` is a [CanJS](https://github.com/bitovi/canjs) plugin that
provides a simple, generic `EventStream` interface for integrating
[FRP](https://en.wikipedia.org/wiki/Functional_reactive_programming)-like
systems into `CanJS`.

When used in tandem with an implementing plugin, such as
[can.bacon](https://github.com/zkat/can.bacon), it results in a fancy new
event binding experience, closely integrated with all the relevant `CanJS` APIs.

`can.eventstream` is
[hosted at Github](http://github.com/zkat/can.eventstream). `can.eventstream` is a
public domain work, dedicated using
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Feel free to do
whatever you want with it.

# Quickstart

### Install

`$ npm install can.eventstream`
or
`$ bower install can.eventstream`

Prebuilt releases are included in `dist`. These expect `CanJS` to be either
globally loaded, or available through `CommonJS` or `AMD` modules.

# Documentation

## CanJS

**This interface is only available when an implementing plugin is
  included. `can.eventstream` will not work by itself.**

`can.eventstream` extends the event binding features of `CanJS` so they return
`EventStream`s whenever an event callback is omitted. . It also takes steps to
normalize event information into a single, consistent event object, depending on
the type of event source. For example, all list events, regardless of event
name, have the same structure.

The examples below assume [can.bacon](https://github.com/zkat/can.bacon) has
been included.

### `can.bind.call(this[, event="change"[, callback]])`

Extends `can.bind()` such that if it's called with only one argument (the
event name), or without any arguments, a `Bacon.EventStream` object is
created, instead of binding a callback to the event.

The actual event values sent into the `EventStream` will vary depending on
the observed value.

See http://canjs.com/docs/can.bind.html for documentation on the default
behavior.

#### Example

```javascript
can.bind.call(new can.Map(), "change").map(".value").log();
```

### `can.delegate.call(this, selector[, event="change"[, callback]])`

Extends `can.delegate()` such that if it's called with only one or two
arguments (the selector, and the event name), a `Bacon.EventStream` object is
created, instead of binding a callback to the event.

The actual event values sent into the `EventStream` will vary depending on
the observed value.

See http://canjs.com/docs/can.delegate.html for documentation on the default
behavior.

#### Example

```javascript
can.delegate.call(window, "a", "click").doAction(".preventDefault").log();
```

### `can.compute#bind([event="change"[, callback]])`

Extends the default CanJS behavior of the `can.compute#bind()` method so that
it returns an `EventStream` of new `can.compute` values, if no `callback` is
provided to the `.bind()` call. If the `callback` is present, this method
reverts to the standard behavior of binding an event listener directly.

#### Example

```javascript
var compute = can.compute(1);
compute.bind().log("compute changed");
compute(2);
// -> compute changed 2
```

### `can.Control#on([context=this.element[, selector[, event="change"[, callback]]]])`

Enhances `can.Control#on` (and by extension, `can.Component#events#on`) so it
can be used to listen to event streams in a memory-safe way, according to the
control/component's lifecycle. Since the default method accepts method names,
this overridden method will first check if the possible `callback` is an
existing property, if it's a string, before determining whether to fall back
to the default behavior, or to return an event stream.

See http://canjs.com/docs/can.Control.prototype.on.html

#### Example

```javascript
...
events: {
  inserted: function() {
    this.on(GlobalStreams.specialEvent).log("special event:");
  }
}
...
$("mycomponent").remove() // logs 'special event: \<end\>'
GlobalStreams.specialEvent.push("whatever"); // Nothing happens

// The following are also equivalent:
this.on(scope, "change").log("Scope changed")
this.on(scope).log("Scope changed")
```

### `can.Map#bind([event="change"[, callback]])`

Replaces the default CanJS behavior of the `can.Map#bind()` method with one
that returns an `EventStream` of event objects or values if the `callback`
argument is not provided.

The values in `EventStream` vary depending on the event being listened to.

For named property events, the new value of the property is returned, as-is.

For `"change"` events, `MapChangeEvent` objects are returned, with the
following properties:

```javascript
{
  event: Object // The CanJS event object.
  which: String // They attr/key affected by the event,
  how: "add"|"remove"|"set" // The type of operation,
  value: Any // For "add"/"set" events, the new value. For "remove" events,
                the removed value.
}
```

Note that this object fits the API required for `Bacon.toCanMap`, so the
`EventStream` returned by this function can be piped into a different
`can.Map` to partially or fully synchronise both maps.

Additionally, The events from that `Map` changing can then be piped back into
the original `Map` without causing circularity issues, achieving two-way
binding between both objects. See example.

#### Example

```javascript
// Binding
var map = new can.Map({x:1});
map.bind().log("map changed:");
map.bind("x").log("x property changed:");
map.attr("x", 2);
// map changed: {event: Object, which: "x", "how": "set", value: 2}
// x property changed: 2

// Piping into a different Map
var map1 = new can.Map();
var map2 = map1.bind().toCanMap(new can.Map());
map1.bind().log("map1 changed:");
map2.bind().log("map2 changed:");

map1.attr("x", 1);
// map2 changed: {event: Object, which: "x", "how": "add", value:1}
// map1 changed: {event: Object, which: "x", "how": "add", value:1}
map2.attr("x", 2);
// map1 changed: {event: Object, which: "x", "how": "set", value:2}
// map2 changed: {event: Object, which: "x", "how": "set", value:2}
console.log(map1.attr(), map2.attr());
// {x:2}, {x:2}
```

### `can.List#bind([event="change"[, callback]])`

Replaces the default CanJS behavior of the `can.List#bind()` method with one
that returns an `EventStream` of event objects or values if the `callback`
argument is not provided.

The values in `EventStream` vary depending on the event being listened to.

For named property events, the new value of the property is returned,
as-is. Both numerical properties (indices) and regular Map attrs can be
bound to.

For the `"length"` events, the new length of the array is returned as-is.

The rest of the events, namely `"change"`, `"add"`, `"remove"`, and `"set"`,
either `ListChangeEvent` or `MapChangeEvent` objects are returned from the
stream, depending on whether the modification involves a numerical key.

For events on numerical properties, `ListChangeEvent` objects are returned,
with the following properties:

```javascript
{
  event: Object // The CanJS event object.
  index: Integer // They initial index of the change.
  how: "add"|"remove"|"set" // The type of operation,
  value: Array | Any // For "add" events, an array of added items.
                        For "remove" events, an array of removed items.
                        For "set", the single new value.
}
```

For events on non-numerical properties, `MapChangeEvent` objects are
returned, using the same structure as `can.Map#bind()`:

```javascript
{
  event: Object // The CanJS event object.
  which: String // They attr/key affected by the event,
  how: "add"|"remove"|"set" // The type of operation,
  value: Any // For "add"/"set" events, the new value. For "remove" events,
                the removed value.
}
```

Note that these objects conform to the API required for `Bacon.toCanList` and
`Bacon.toCanMap` respectively, so the `EventStream` returned by this function
can be piped into a different `can.List` or `can.Map` to synchronise both.

Unlike the stream returned by `can.Map#bind()`, this one cannot be used for
two-way binding out of the box, since `add` events will bounce back and forth
infinitely and cause an overflow. One-way binding works fine, though, and can
easily handle lists of different lengths.

### `can.bindComputeFromStream(stream[, compute=can.compute()])`

Returns a `can.compute` whose value changes whenever `stream` has a new value If
a compute is provided, it will be used instead of creating a new one.

### `can.bindMapFromStream(stream[, map=new can.Map()])`

Returns a `can.Map` whose value is managed by a stream of incoming map change
events.

If `map` is provided, it *must* be a `can.Map` instance (or an instance of a
subclass), which will be used instead of creating a new empty `can.Map`.

Two kinds of event objects are accepted:

```javascript
// Modification event. Modifies a single key.
{
  how: "set"|"add"|"remove", // The type of operation.
  which: String, // The key to modify.
  value: Any, // The value to set. Optional for `remove`.
}
```

```javascript
// Replacement event. Uses `.attr()` to replace multiple keys.
{
  how: "replace", // Must be this string.
  value: Object, // Object to replace with.
  removeOthers: Boolean // Passed to `.attr()`. See http://canjs.com/docs/can.Map.prototype.attr.html#sig_map_attr_obj__removeOthers__
}
```

### `can.bindListFromStream(stream[, list=new can.List()])`

Returns a `can.List` whose value is managed by a stream of incoming list
and/or map change events.

If `list` is provided, it *must* be a `can.List` instance, which will be used
instead of creating a new empty instance.

Three kinds of event objects are accepted:

```javascript
// Modification event. Modifies a single index or key.
{
  how: "set"|"add"|"remove", // The type of operation.
  which: String|Integer, // The key to modify.
  value: Any, // The value to set. For "add" on an Integer index, must be an
                 Array-like. Optional for `remove`.
}
```

```javascript
// Replacement event. Calls `.replace()`
{
  how: "replace", // Must be this string.
  value: Array-like, // Array-like to replace contents with.
  removeOthers: Boolean=true (optional) // Whether to keep trailing elements
                                           after value has been applied. If
                                           this argument is provided, the
                                           list will be replaced using
                                           `.attr()`. Otherwise, `.replace()`
                                           will be used. See:
                                           http://canjs.com/docs/can.List.prototype.attr.html#sig_list_attr_elements__replaceCompletely__
}
```

## Plugin API

The API described here must be used by implementor plugins in order to provide
`EventStream`s to `CanJS`. Currently, `can.eventstream` supports only a single
global plugin loaded into an instance of `can`.

In order to implement this API, an object named EventStream must be added to the
`can` namespace. This object can be anything, provided it has the following 4
functions in it.

An example implementation of this plugin using
[bacon.js](https://github.com/baconjs/bacon.js) is available as
[can.bacon](https://github.com/zkat/can.bacon)

### `can.EventStream.isEventStream(stream)`

Must be implemented by a can.eventstream plugin.

Returns a truthy value if `stream` is a compatible event stream.

### `can.EventStream.bind(context, event, selector)`

Must be implemented by a can.eventstream plugin.

Returns an event stream that will listen to events, using the given `event` and
`selector` parameters.

### `can.EventStream.onValue(stream, callback)`

Must be implemented by a can.eventstream plugin.

Binds `callback` such that it will be called on `stream` values. Callback
invocation mechanics are left to the implementing plugin.

### `can.EventStream.untilStream(stream, until)`

Must be implemented by a can.eventstream plugin.

Returns an event stream that will terminate as soon as a new value becomes
available in the given `until` stream.
