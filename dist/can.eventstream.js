(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("can"));
	else if(typeof define === 'function' && define.amd)
		define(["can"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("can")) : factory(root["can"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/ 	
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __moduleName = "src/index";
	var can = __webpack_require__(1);
	var oldBind = can.bind;
	can.bind = function(ev, cb) {
	  if (cb && can.isEventStream(this)) {
	    return can.onEventStreamValue(this, cb);
	  } else if (cb) {
	    return oldBind.apply(this, arguments);
	  } else {
	    return can.bindEventStream(this, ev);
	  }
	};
	var oldDelegate = can.delegate;
	can.delegate = function(selector, ev, cb) {
	  if (cb) {
	    return oldDelegate.apply(this, arguments);
	  } else {
	    return can.bindEventStream(this, ev, selector);
	  }
	};
	var oldBindAndSetup = can.bindAndSetup;
	can.bindAndSetup = function(ev, cb) {
	  return cb ? oldBindAndSetup.apply(this, arguments) : can.bindEventStream(this, ev);
	};
	var oldControlOn = can.Control.prototype.on;
	can.Control.prototype.on = function(ctx, selector, eventName, func) {
	  if (!ctx) {
	    return oldControlOn.apply(this, arguments);
	  }
	  if (can.isEventStream(ctx)) {
	    return can.eventStreamUntil(ctx, can.bind.call(this, "destroyed"));
	  } else {
	    return oldControlOn.apply(this, arguments);
	  }
	};
	can.Map.prototype.bind = can.bindAndSetup;
	can.Map.prototype.getEventValueForStream = function(args) {
	  switch (args[0] && args[0].type) {
	    case "change":
	      return new MapChangeEvent(args);
	    default:
	      var target = args[0].target;
	      if (target._data && target._data.hasOwnProperty(args[0].type)) {
	        return args[1];
	      } else {
	        return args;
	      }
	  }
	};
	function MapChangeEvent(args) {
	  this.event = args[0];
	  this.which = args[1];
	  this.how = args[2];
	  this.value = args[3];
	  this.oldValue = args[4];
	}
	can.List.prototype.getEventValueForStream = function(args) {
	  switch (args[0] && args[0].type) {
	    case "change":
	    case "set":
	    case "add":
	    case "remove":
	      return new ListChangeEvent(args);
	    case "length":
	      return args[1];
	    default:
	      var target = args[0].target;
	      var _type = args[0].type;
	      if (target.hasOwnProperty(args[0].type)) {
	        return isNaN(_type) ? args[1] : args[1][0];
	      } else {
	        return args;
	      }
	  }
	};
	function ListChangeEvent(args) {
	  this.event = args[0];
	  switch (this.event.type) {
	    case "change":
	      this.index = isNaN(args[1]) ? args[1] : +args[1];
	      this.how = args[2];
	      this.value = this.how === "remove" ? args[4] : args[3];
	      this.oldValue = args[4];
	      break;
	    case "set":
	    case "add":
	    case "remove":
	      this.index = args[2];
	      this.how = this.event.type;
	      this.value = args[1];
	      this.oldValue = null;
	      break;
	    default:
	      throw new Error("Unexpected can.List event: " + this.event.type);
	  }
	}
	can.bindComputeFromStream = function(stream) {
	  var compute = arguments[1] !== (void 0) ? arguments[1] : can.compute();
	  can.onEventStreamValue(stream, compute);
	  return compute;
	};
	can.bindMapFromStream = function(stream) {
	  var map = arguments[1] !== (void 0) ? arguments[1] : new can.Map();
	  can.onEventStreamValue(stream, (function(ev) {
	    return syncAsMap(map, ev);
	  }));
	  return map;
	};
	can.bindListFromStream = function(stream) {
	  var list = arguments[1] !== (void 0) ? arguments[1] : new can.List();
	  can.onEventStreamValue(stream, (function(ev) {
	    return syncAsList(list, ev);
	  }));
	  return list;
	};
	function syncAsMap(map, val) {
	  var key = val.hasOwnProperty("which") ? val.which : val.index;
	  switch (val.how) {
	    case "set":
	      map.attr(key, val.value);
	      break;
	    case "add":
	      map.attr(key, val.value);
	      break;
	    case "remove":
	      map.removeAttr(key);
	      break;
	    case "replace":
	      map.attr(val.value, val.removeOthers);
	      break;
	    case undefined:
	      console.warn("Missing event type on change event: ", val);
	      map.attr(val);
	      break;
	    default:
	      console.warn("Unexpected event type: ", val.how);
	      map.attr(val);
	  }
	}
	function syncAsList(list, val) {
	  var isMapEvent = val.hasOwnProperty("which") || isNaN(val.index);
	  if (isMapEvent && val.how !== "replace") {
	    syncAsMap(list, val);
	  } else {
	    switch (val.how) {
	      case "set":
	        list.attr(val.index, val.value);
	        break;
	      case "add":
	        list.splice.apply(list, [val.index, 0].concat(val.value));
	        break;
	      case "remove":
	        list.splice(Math.min(val.index, !list.length ? 0 : list.length - 1), val.value ? val.value.length : 1);
	        break;
	      case "replace":
	        if (val.hasOwnProperty("removeOthers")) {
	          list.attr(val.value, val.removeOthers);
	        } else {
	          list.replace(val.value);
	        }
	        break;
	      case undefined:
	        console.warn("Missing event type on change event: ", val);
	        list.replace(val.value);
	        break;
	      default:
	        console.warn("Unexpected event type: ", val.how);
	        list.replace(val.value);
	    }
	  }
	}
	


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }
/******/ ])
})

//# sourceMappingURL=can.eventstream.js.map