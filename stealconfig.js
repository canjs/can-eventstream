System.config({
  map: {
	"jquery/jquery": "jquery"
  },
  paths: {
    "can.eventstream": "./src/index.js",
	"jquery": "node_modules/jquery/dist/jquery.js",
	"can": "node_modules/canjs/can.js"
  },
  meta: {
    can: {
      exports: "can",
      deps: ["jquery"]
    },
	jquery: {
	  exports: "jQuery"
	}
  }
});
