module.exports = function (grunt) {

  'use strict';

  grunt.initConfig({
    jshint: {
      files: [
        'Gruntfile.js',
        'scripts/**/*.js',
        '!scripts/vendor/**/*.js',
        '!scripts/*.min.js'
      ],
      options: {
        browser: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        trailing: true,
        strict: true,
        predef: [
          'require', 'module',
          'console', 'alert',
          'angular',
          'app'
        ]
      }
    },
    nodewebkit: {
      options: {
        build_dir: '/Users/nico/Documents/webkitbuilds',
        version: '0.8.1',
        mac: true,
        win: true,
        linux32: false,
        linux64: false
      },
      src: ['./**/*']
    },
    jade: {
      compile: {
        options: {
          pretty: true
        },
        files: {
          'views/main.html': 'views/main.jade',
          'views/index.html': 'views/index.jade',
          'views/images.html': 'views/images.jade',
          'views/users.html': 'views/users.jade',
          'views/newUser.html': 'views/newUser.jade',
          'views/help.html': 'views/help.jade'
        }
      }
    },
    less: {
      compile: {
        files: {
          'css/style.css': 'css/style.less'
        }
      }
    },
    watch: {
      jade: {
        files: ['views/*.jade'],
        tasks: ['newer:jade'],
      },
      less: {
        files: ['css/*.less'],
        tasks: ['newer:less']
      },
      options: {
        spawn: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('hint', ['jshint']);
  grunt.registerTask('default', ['jade', 'less']);
  grunt.registerTask('build', ['jade', 'less', 'nodewebkit']);

};