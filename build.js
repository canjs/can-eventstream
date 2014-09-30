var pluginifier = require("steal-tools").pluginifier;
var fs = require("fs");

pluginifier({
  main: "can.eventstream",
  config: __dirname + "/stealconfig.js"
}).then(function(pluginify){
  // Get the main module, ignoring a dependency we don't want.
  var mainAlone = pluginify("can.eventstream", {
    ignore: ["can"]
  });

  // Now you can do whatever you want with the module.
  fs.writeFileSync("test_build.js", mainAlone, "utf8");
}).catch(function(e) {
  setTimeout(function() {
    throw e;
  }, 10);
});
