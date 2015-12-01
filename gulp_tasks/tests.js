'use strict';

var gulp = require('gulp'),
    karmaServer  = require('karma').Server;

gulp.task('watch-test', ['js', 'scss'], function(done) {
  new karmaServer({configFile: __dirname + '/../karma.conf.js', singleRun: false, autoWatch: true},done).start();
});

gulp.task('test', ['js', 'scss'], function(done) {
  new karmaServer({configFile: __dirname + '/../karma.conf.js', singleRun: true, autoWatch: false},done).start();
});
