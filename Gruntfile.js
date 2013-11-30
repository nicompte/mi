module.exports = function (grunt) {

  'use strict';

  grunt.initConfig({
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
          "views/main.html": "views/main.jade",
          "views/index.html": "views/index.jade",
          "views/images.html": "views/images.jade",
          "views/users.html": "views/users.jade",
          "views/newUser.html": "views/newUser.jade",
          "views/help.html": "views/help.jade"
        }
      }
    },
    less: {
      compile: {
        files: {
          'style.css': 'style.less'
        }
      }
    },
    watch: {
      jade: {
        files: ['views/*.jade'],
        tasks: ['newer:jade'],
      },
      less: {
        files: ['*.less'],
        tasks: ['newer:less']
      },
      options: {
        spawn: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('default', ['jade', 'less']);
  //grunt.registerTask('watch', ['watch']),
  grunt.registerTask('build', ['jade', 'less', 'nodewebkit']);

};