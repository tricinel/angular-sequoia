'use strict';

var gulp = require('gulp'),
    noop = function () {},
    $ = require('gulp-load-plugins')({
      pattern: ['gulp-*', 'del']
    });

gulp.task('bump-version', function(){
  gulp.src('./bower.json')
  .pipe($.bump())
  .pipe(gulp.dest('./'));
});

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('build', ['clean', 'scripts', 'styles']);

gulp.task('bump', ['build', 'bump-version']);
