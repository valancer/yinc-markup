module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// html
		includes: {
			build: {
				cwd: 'sources/html',
				src: [ '*.html'],
				dest: 'build/',
				options: {
					flatten: true,
					includePath: 'sources/html/include'
				}
			}
		},

		// css
		sprite: {
			all: {
				src: ['sources/assets/images/sprites/*.png'],
				retinaSrcFilter: ['sources/assets/images/sprites/*@2x.png'],
				dest: 'sources/assets/images/sprites.png',
				retinaDest: 'sources/assets/images/sprites@2x.png',
				imgPath: '/assets/images/sprites.png',
				retinaImgPath: '/assets/images/sprites@2x.png',
				destCss: 'sources/assets/styles/scss/_sprites.scss',
				padding: 5,
				cssVarMap: function(sprite) {
					sprite.name = 's-' + sprite.name;
				}
   			}
		},
		sass: {
			build: {
				files: [{
					expand: true,
					cwd: 'sources/assets/styles/scss',
					src: ['*.scss'],
					dest: 'sources/assets/styles/',
					ext: '.css'
				}]
			}
		},
		autoprefixer: {
			options: {
				browsers: ['last 2 versions']
			},
			build: {
				expand: true,
				flatten: true,
				dest: 'sources/assets/styles/',
				src: ['sources/assets/styles/*.css', '!sources/assets/styles/*.min.css']
			}
		},
		csscomb: {
			options: {
				config: 'config/csscomb.json'
			},
			dist: {
				expand: true,
				cwd: 'build/assets/styles/',
				src: ['*.css', '!*.min.css'],
				dest: 'build/assets/styles/'
			}
		},

		// scripts
		jshint: {
			files: ['Gruntfile.js', 'sources/assets/scripts/**/*.js', '!sources/assets/scripts/libs/**'],
			options: {
				reporter: require('jshint-stylish')
			}
		},


		// files
		clean: {
			build: {
				files: [{
					src: ['build/**']
				}]
			}
		},

		copy: {
			assets: {
				files: [{
					expand: true,
					cwd: 'sources/assets',
					src: ['**', '!**/scss/**', '!**/psd/**', '!**/sprites/**'],
					dest: 'build/assets/'
				}]
			},
			scripts: {
				files: [{
					expand: true,
					cwd: 'sources/assets/scripts/',
					src: ['*.js'],
					dest: 'build/assets/scripts/'
				}]
			},
			styles: {
				files: [{
					expand: true,
					cwd: 'sources/assets/styles/',
					src: ['*.css'],
					dest: 'build/assets/styles/'
				}]
			},
			images: {
				files: [{
					expand: true,
					cwd: 'sources/assets/images/',
					src: ['**', '!**/sprites/**'],
					dest: 'build/assets/images/'
				}]
			},
			release: {
				files: [{
					expand: true,
					cwd: 'build/',
					src: ['**', '**/**'],
					dest: 'release/'
				}]
			}
		},


		// watch
		watch: {
			html: {
				files: ['sources/html/**/*.html'],
				tasks: ['includes'],
				options: {
					livereload: true
				}
			},

			sass: {
				files: ['sources/assets/styles/scss/**/*.scss'],
				tasks: ['sass', 'newer:autoprefixer', 'newer:copy:styles'],
				options: {
					livereload: true
				}
			},

			styles: {
				files: ['sources/assets/styles/*.css'],
				tasks: ['newer:copy:styles'],
				options: {
					livereload: true
				}
			},

			scripts: {
				files: ['<%= jshint.files %>'],
				tasks: ['newer:copy:scripts'],
				options: {
					livereload: true
				}
			},

 			images: {
 				files: ['sources/assets/images/**'],
 				tasks: ['sprite', 'copy:images'],
 				options: {
 					livereload: true
 				}
 			}
		},

		// connect
		connect: {
			options: {
				port: 9002,
				livereload: true,
				// keepalive: true
			},
			livereload: {
				options: {
					open: {
						target: 'http://localhost:9002/'
					},
					base: [
						'build/'
					]
				}
			}
		}
	});

	// grunt.loadTasks('tasks');

	grunt.registerTask('sass-build', ['sprite', 'sass', 'autoprefixer']);
	grunt.registerTask('sass-release', ['sprite', 'sass', 'autoprefixer']);
	grunt.registerTask('scripts-build', ['newer:jshint']);
	grunt.registerTask('html-build', ['includes']);
	grunt.registerTask('build', ['clean', 'sass-build', 'scripts-build', 'html-build', 'copy:assets', 'connect', 'watch']);
	grunt.registerTask('release', ['clean', 'sass-release', 'scripts-build', 'html-build', 'copy:assets', 'csscomb', 'copy:release']);

};
