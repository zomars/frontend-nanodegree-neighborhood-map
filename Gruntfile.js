'use strict';

module.exports = function(grunt){
	//load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	var mozjpeg = require('imagemin-mozjpeg');

	// Project configuration.
	var pkg = require('./package.json');

	// Get Current Working Directory Name
	var path = require('path');
	var cwd = process.cwd().split(path.sep).pop();

	// CONFIGURABLE VARS
	//  The rest of this Gruntfile. Basically, any value that is used in
	//  multiple places should be put here for ease of maintenance.
	//  Update the value here, and all other places are updated automagically.
	var config = {
		devPort : 80,
		devURL  : cwd+".dev",
		app     : "app",
		dist    : "dist"
	};

	grunt.initConfig({
		// CONFIG
		//  Create an object that contains the constants from above.
		config: config,

		// BROWSER SYNC
		//  This task makes the workflow faster by synchronising URLS,
		//  interactions and code changes across multiple devices.
		browserSync: {
			dev: {
				bsFiles: {
					src: '<%= config.app %>/css/**/*.css'
				},
				options: {
					proxy: "<%= config.devURL %>",
					watchTask: true, // < MANDATORY
					browser: ["google chrome"],
					open: false, // Don't open the browser on server start
					files: [
						'<%= config.app %>/css/**/*.css',
						'<%= config.app %>/js/**/*',
						'<%= config.app %>/img/**/*',
						'<%= config.app %>/**/*.{php,html,twig}'
					]
				}
			}
		},

		// WATCH
		//  The watch operation will watch a set of files
		//  and run other operations when those those files are
		//  edited or otherwise changed
		watch: {
			livereload: {
				options: { livereload : 1025 },
				files: [
					'<%= config.app %>/css/**/*.css',
					'<%= config.app %>/js/**/*',
					'<%= config.app %>/img/**/*',
					'<%= config.app %>/**/*.{php,html,twig}'
				]
			},
		},

		// CACHE-BREAKER
		// Append a md5 hash to 'main.css' which is located in 'layout.twig'
		cachebreaker: {
			dist: {
				options: {
					match: ['main.css'],
					replacement: 'md5',
					src: {
						path: '<%= config.dist %>/css/main.css'
					}
				},
				files: {
					src: ['<%= config.dist %>/**/*.{php,html,twig}'] // Experimental!
					// Revert to index.php if fails
				}
			}
		},

		// IMAGEMIN
		imagemin: {
			dist: {
				options: {                       // Target options
						optimizationLevel: 3,
						svgoPlugins: [{ removeViewBox: false }],
						use: [mozjpeg()]
				},
				files: [{
					expand: true,                     // Enable dynamic expansion
					cwd: '<%= config.app %>/',        // Src matches are relative
													  // to this path
					src: ['**/*.{png,jpg,jpeg,gif}'], // Actual patterns to match
					dest: '<%= config.dist %>/'       // Destination path prefix
				}]
			}
		},

		// COPY
		//  The copy task does simply copying of files from one location to another.
		//  Most of the otheroperations allow for putting their output files in a
		//  particular location. However, some files are "static" and not used in
		//  any operations. The copy operation can be used to copy those files as needed,
		//  for example, moving files from the app folder to the dist folder for a push
		//  to production.
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.app %>',
					dest: '<%= config.dist %>',
					src: [
						'*.{ico,png,txt,yml}',
						'.htaccess',
						'../.gitignore',
						'img/**/*.{png,jpg,webp,gif,ico,svg}',
						'css/**/*.{css}',
						'css/img/*.{png,jpg,gif,svg}',
						'js/**/*',
						'**/*.{php,html,twig}'
					]
				}]
			}
		},

		// CLEAN
		//  The clean operation is useful to clean out folders prior to copying
		//  over new files. This operation will delete the contents of the folder.
		//  This operation is usually one of the first called when running grunt tasks
		//  to clean up our output directories before the remaining tasks copy new files
		//  to them.
		clean: {
			dist: {  //For the dist task we need to clean several folders
				files: [{
					dot: true,
					src: [
						'<%= config.dist %>/**/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			}
		},

		// PROCESSHTML
		// Process html files at build time to modify them depending
		// on the release environment
		processhtml: {
			dist: {
				files: [{
					expand: true,               // Enable dynamic expansion.
					dot: true,
					cwd: '<%= config.dist %>',  // Src matches are relative to this path.
					dest: '<%= config.dist %>', // Destination path prefix.
					src: [
						'**/*.php',
						'**/*.html',
						'**/*.{php,html,twig}'
					],
				}]
			}
		},

		// CSSMIN
		// This takes the compiled CSS file regardless of it's
		// state and cleans it up of comments, compresses and
		// minifies it and adds a .min suffix.
		cssmin: {
			dist: {
				options: {
					keepSpecialComments: false,
					rebase: false, // whether to skip URLs rebasing
				},
				files: [{
					expand: true,
					cwd: '<%= config.app %>',
					dest: '<%= config.dist %>',
					src: ['css/**/*.css', 'css/**/!*.min.css'],
				}]
			}
		},
		uglify: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>',
					dest: '<%= config.dist %>',
					src: 'js/**/*.js'
				}]
			}
		},
		buildcontrol: {
			options: {
				dir: 'dist',
				commit: true,
				push: true,
				message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
			},
			pages: {
				options: {
					remote: 'git@github.com:zomars/frontend-nanodegree-neighborhood-map.git',
					branch: 'gh-pages'
				}
			}
		}
	});
	// END INITCONFIG()




	/******************************************************************\
	|*  GRUNT TASK SETUP
	|*
	|*  In this section, we will define and configure the different
	|*  tasks that we want to be able to run using grunt. To run
	|*  a task, simply call grunt <taskname> from the commandline.
	|*  We'll also define a 'default' task to be run when no task
	|*  is provided.
	|*
	\*******************************************************************/


	// SERVER
	//  The server task is used to "start a server". If you are using php's built-in
	//  web server for development testing, it will be started up. We'll start watching
	//  any files that need to be watched for changes, and open a browser to our dev URL
	grunt.registerTask('server', [
		'browserSync',
		'watch'
	]);

	// BUILD
	//  The build task will "build" our project, and put the final output into
	// the dist folder, making it ready for deployment to our production environment.
	grunt.registerTask('build', [
		'imagemin:dist',
		'clean:dist',
		'copy:dist',
		'processhtml:dist',
		'cssmin:dist',
		'uglify:dist',
		'cachebreaker:dist',
		'buildcontrol:pages'
	]);
}
