var webpackConfig = require("./webpack.config");

module.exports = function (grunt) {
// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		clean: ["dist"],
		bump: {
			options: {
				files: ["package.json"],
				updateConfigs: ["pkg"],
				commit: false,
				createTag: false,
				push: false,
				prereleaseName: "beta"
			}
		},
		release: {
			options: {
				bump: false,
				commit: false,
				add: false
			}
		},
		eslint: {
			target: "lib/*.js"
		},
		availabletasks: {
			tasks: {
				options: {
					filter: "exclude",
					tasks: ["availabletasks", "default"],
					showTasks: ["user"]
				}
			}
		},
		webpack: {
			main: webpackConfig("production")[0]
		}
	});

	// Load the plugin that provides the tasks.
	require("load-grunt-tasks")(grunt);

	grunt.registerTask("publish", ["release"]);
	grunt.registerTask("validate", ["webpack", "eslint"]);
	grunt.registerTask("build", ["bump:prerelease", "clean", "webpack"]);
	grunt.registerTask("build:patch", ["bump:patch", "clean", "webpack"]);
	grunt.registerTask("build:minor", ["bump:minor", "clean", "webpack"]);
	grunt.registerTask("build:major", ["bump:major", "clean", "webpack"]);
	grunt.registerTask("default", ["availabletasks"]);
};
