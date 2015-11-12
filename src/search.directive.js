(function() {
  'use strict';

  function sequoiaSearchDirective(){

    return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'sequoia-search.html',
      scope: {
        'tree': '=',
        'isSearching': '='
      },
      link: function(scope, element, attrs) {
        scope.search = function() {
          if(scope.query.length) {
            scope.isSearching = scope.query ? true : false;
            scope.tree.setCurrentNodes(scope.tree.find(scope.tree.template.title, scope.query));
          } else {
            scope.clear();
          }
        };

        scope.clear = function() {
          scope.query = '';
          scope.isSearching = false;
          scope.tree.setCurrentNodes();
        };
      }
    };

  }

  angular.module('ngSequoia')
    .directive('sequoiaSearch', sequoiaSearchDirective);

})();