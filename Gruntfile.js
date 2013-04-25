module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';\n\n\n'
            },
            dist: {
                src: [
                    'src/intro.js',
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
        }
        
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
    

};