var gulp         = require('gulp');
var jshint       = require('gulp-jshint');
var ngTemplates  = require('gulp-angular-templatecache');
var rename       = require('gulp-rename');
var uglify       = require('gulp-uglify');
var concat       = require('gulp-concat');
var sass         = require('gulp-sass');
var csso         = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var karmaServer  = require('karma').Server;
var bump         = require('gulp-bump');
var stripDebug = require('gulp-strip-debug');

gulp.task('scss', function () {
  return gulp.src(['src/**/*.scss'])
    .pipe(sass({style: 'expanded'}))
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist/'));
});

var del          = require('del');
var stylish      = require('jshint-stylish');

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('js', ['partials'], function() {
  return gulp.src(['src/**/*.js', '.tmp/inject/**/*js'])
    .pipe(concat('angular-sequoia.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('partials', function () {
  return gulp.src(['src/**/*.html'])
    .pipe(ngTemplates('templateCacheHtml.js', {
      module: 'ngSequoia'
    }))
    .pipe(gulp.dest('.tmp/inject/'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.{js,html}', ['lint', 'js']);
  gulp.watch('src/**/*.scss', ['scss']);
});

gulp.task('clean', function(cb) {
  del(['dist'], cb);
});

gulp.task('bump', function(){
  gulp.src('./bower.json')
  .pipe(bump())
  .pipe(gulp.dest('./'));
});

gulp.task('scripts', ['lint', 'js'], function(){
  return gulp.src(['dist/*.js', '!dist/*.min.js'])
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('styles', ['scss'], function(){
  return gulp.src(['dist/*.css', '!dist/*.min.css'])
    .pipe(csso())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['js', 'scss', 'watch']);

gulp.task('build', ['scripts', 'styles', 'bump']);

gulp.task('test', ['js', 'scss'], function(done) {
  new karmaServer({configFile: __dirname + '/karma.conf.js', singleRun: true, autoWatch: false},done).start();
});
