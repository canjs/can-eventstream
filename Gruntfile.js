module.exports = function(grunt) {
  var sh = require("execSync");
  grunt.loadNpmTasks("steal-tools");
  grunt.loadNpmTasks("testee");
  grunt.initConfig({
    testee: {
      local: ["./test/test.html"]
    },
    stealPluginify: {
      lib: {
        system: {
          main: "src/index"
        },
        options: {},
        outputs: {
          "can.eventstream": {
            ignore: ["can", "jquery"],
            dest: __dirname + "/dist/can.eventstream.js",
            minify: false
          },
          "can.eventstream.min": {
            ignore: ["can", "jquery"],
            dest: __dirname + "/dist/can.eventstream.min.js",
            minify: true
          }
        }
      }
    }
  });

  grunt.registerTask("default", ["test", "build"]);
  grunt.registerTask("test", ["testee:local"]);
  grunt.registerTask("build", ["stealPluginify"]);
  grunt.registerTask("update-build", "Commits the built version", function() {
    exec([
      "git add ./dist",
      "git commit --allow-empty -m 'Updating build files'"
    ]);
  });
  grunt.registerTask("tag", "Tag a new release on master", function(type) {
    type = type || "patch";
    exec([
      "git remote update",
      "git checkout master",
      "git pull --ff-only",
      "npm version "+type+" -m 'Upgrading to %s'",
      "git checkout develop",
      "git pull --ff-only",
      "git merge master"
    ]);
  });
  grunt.registerTask("release", "Make a release", function(type) {
    grunt.task.run("build", "update-build", "tag"+(type?":"+type:""));
  });
  grunt.registerTask("publish", "Publish to npm and bower", function() {
    exec([
      "git push origin develop:develop",
      "git push origin master:master",
      "git push --tags",
      "npm publish ."
    ]);
  });

  function exec(commands) {
    commands.forEach(function(cmd) {
      var result = sh.exec(cmd);
      grunt.log.write(result.stdout || "");
      grunt.log.write(result.stderr || "");
      if (result.code) {
        throw new Error("exit "+result.code);
      }
    });
  }
};
