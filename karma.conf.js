'use strict';

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/**/*.js',
      'tests/**/*.js'
    ],
    plugins : ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-chrome-launcher'],
    reporters: ['progress']
  });
};
