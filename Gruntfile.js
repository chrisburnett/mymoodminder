module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        uglify: {
            my_target: {
                files: {
                    'www/dist/dist_js/app.min.js': ['www/dist/dist_js/app.js']
                }
            }
        },
        compress: {
            release: {
                options: {
                    //archive: 'dist/app.zip'
                },
                files: [
                    {expand: true, src: ['dist_js/app.min.js'], cwd: 'www/dist/'},
                    {expand: true, src: ['dist_js/app/templates.js'], cwd: 'www/dist/'},
                    {expand: true, src: ['dist_css/*'], cwd: 'www/dist/'},
                    {expand: true, src: ['lib/**'], cwd: 'www/'},
                    {expand: true, src: ['images/**'], cwd: 'www/'},
                    {expand: true, src: ['resources/**'], cwd: 'www/', dot: true},
                    {expand: true, src: ['config.xml'], cwd: 'www/'},
                    {expand: true, src: ['index.html'], cwd: 'www/dist/'}
                ]
            }
        }
    });

    // Load tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Default task.
    grunt.registerTask('default', 'compress');

    //Custom tasks
    grunt.registerTask('build-app-release', ['uglify', 'compress']);
};
