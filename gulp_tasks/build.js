'use strict';

var gulp = require('gulp'),
    noop = function () {},
    $ = require('gulp-load-plugins')({
      pattern: ['gulp-*', 'del']
    });

gulp.task('bump-version', function(){
  var bumpType = process.env.BUMP || 'patch'; // major.minor.patch

  gulp.src(['./bower.json', './package.json'])
  .pipe($.bump({ type: bumpType }))
  .pipe(gulp.dest('./'));
});

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('build', ['clean', 'scripts', 'styles']);

gulp.task('bump', ['build', 'bump-version']);
