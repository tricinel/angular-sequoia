(function() {
  'use strict';

  function sequoiaTreeDirective(Tree){

    return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'angular-sequoia.html',
      scope: {
        'treeNodes': '=sequoiaTree',
        'model': '=',
        'template': '=nodeTemplate',
        'modal': '='
      },
      link: function(scope, element, attrs) {
        scope.model = _.isArray(scope.model) ? scope.model : [];
        scope.breadcrumbs = [];

        var tree = new Tree(scope.treeNodes, scope.template);

        scope.load = function(node) {
          if(tree.isValidNode(node)) {
            tree.setCurrentNodes(node[tree.template.nodes]);
            scope.breadcrumbs = tree.breadcrumbs(node[tree.template.id]);
          } else {
            tree.setCurrentNodes();
            scope.breadcrumbs = [];
          }
        };

        scope.select = function(node) {
          if(node._id) {
            scope.model.push(node[tree.template.id]);
          }
        };

        scope.remove = function(node) {
          var index = node._id ? _.indexOf(scope.model,node[tree.template.id]) : -1;
          if(index !== -1) {
            scope.model.splice(index, 1);
          }
        };

        scope.isSelected = function(node) {
          return _.indexOf(scope.model, node[tree.template.id]) !== -1 ? true : false;
        };

        scope.toggleSelected = function() {
          if(scope.onlySelected) {
            scope.onlySelected = false;
            tree.setCurrentNodes();
          } else {
            scope.onlySelected = true;
            var selected = tree.findSelected(scope.model);
            tree.setCurrentNodes(selected);
          }
        };

        scope.tree = tree;

        scope.showModal = function() {
          scope.load();
          scope.modalShown = true;
        };

        scope.closeModal = function() {
          scope.modalShown = false;
        }

        if(!scope.modal) {
          scope.load();
        }
      }
    };

  }

  sequoiaTreeDirective.$inject = ['SequoiaTree'];

  angular.module('ngSequoia')
    .directive('sequoiaTree', sequoiaTreeDirective);

})();