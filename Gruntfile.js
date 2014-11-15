module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            main: {
                src: ['src/core.js', 'src/method/*.js', 'src/execute_bind.js'],
                dest: 'build/Release/as.js'
            }
        },
        jscs: {
            main: ['src/*.js', 'src/**/*.js'],
            grunt: ['Gruntfile.js', 'build/tasks/*.js']
        },
        uglify: {
            options: {
                preserveComments: false
            },
            main: {
                files: {
                    'build/Release/as.min.js': 'build/Release/as.js'
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    hostname: 'localhost'
                }
            }
        },
        qunit: {
            all: {
                options: {
                    urls: ['http://localhost:8000/tests/unit/core/index.html']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['lint', 'test']);
    grunt.registerTask('test', ['connect', 'qunit']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('lint', ['jscs']);

    grunt.registerTask('all', ['build', 'jscs', 'test']);
};
