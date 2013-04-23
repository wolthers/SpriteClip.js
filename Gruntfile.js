module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';\n'
            },
            dist: {
                src: [
                    'src/intro.js',
                    'src/SpriteClipEvent.js',
                    'src/Timeout.js',
                    'src/TimeoutManager.js',
                    'src/SpriteClip.js',
                    'src/outro.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*!\n'
                + ' * <%= pkg.name %> v<%= pkg.version %>\n'
                + ' * \n'
                + ' * MIT Licensed: <%= pkg.licenses[0].url %>\n'
                + ' * \n'
                + ' * <%= pkg.homepage %>\n'
                + ' * \n'
                + ' * Copyright (C) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n'
                + ' */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jsdoc : {
            dist : {
                src: [
                    'src/SpriteClipEvent.js',
                    'src/Timeout.js',
                    'src/TimeoutManager.js',
                    'src/SpriteClip.js'
                ],
                options: {
                    destination: 'doc'
                }
            }
        }
        
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['concat', 'uglify', 'jsdoc']);
    

};