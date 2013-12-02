module.exports = function (grunt) {

  'use strict';

  grunt.initConfig({
    jshint: {
      files: [
      'src/Gruntfile.js',
      'src/scripts/**/*.js',
      '!src/scripts/vendor/**/*.js',
      '!src/scripts/*.min.js'
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
        build_dir: '../mi-builds',
        version: '0.8.1',
        mac: true,
        win: true,
        linux32: false,
        linux64: false
      },
      src: ['./src/**/*']
    },
    jade: {
      compile: {
        options: {
          pretty: true
        },
        files: {
          'src/views/main.html': 'src/views/main.jade',
          'src/views/index.html': 'src/views/index.jade',
          'src/views/images.html': 'src/views/images.jade',
          'src/views/users.html': 'src/views/users.jade',
          'src/views/users.receive.html': 'src/views/users.receive.jade',
          'src/views/users.send.html': 'src/views/users.send.jade',
          'src/views/newUser.html': 'src/views/newUser.jade',
          'src/views/newUserSend.html': 'src/views/newUserSend.jade',
          'src/views/help.html': 'src/views/help.jade',
          'src/views/upload.html': 'src/views/upload.jade'
        }
      }
    },
    less: {
      compile: {
        files: {
          'src/css/style.css': 'src/css/style.less'
        }
      }
    },
    compress: {
      main: {
        options: {
          archive: '../mi-builds/releases/mi/win/mi-windows.zip'
        },
        files: [
          {cwd: '../mi-builds/releases/mi/win/mi/', src: ['**/*'], expand: true, flatten: true},
          ]
        }
      },
      watch: {
        jade: {
          files: ['src/views/*.jade'],
          tasks: ['newer:jade'],
        },
        less: {
          files: ['src/css/*.less'],
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
grunt.loadNpmTasks('grunt-contrib-compress');

grunt.registerTask('hint', ['jshint']);
grunt.registerTask('default', ['jade', 'less']);
grunt.registerTask('build', ['jade', 'less', 'nodewebkit', 'compress']);

};