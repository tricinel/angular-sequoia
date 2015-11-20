(function() {
  'use strict';

  function sequoiaTreeDirective(Tree){

    return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'angular-sequoia.html',
      scope: {
        'treeNodes': '=sequoiaTree',
        'model': '=ngModel',
        'template': '=nodeTemplate',
        'options': '='
      },
      link: function(scope) {
        scope.canEdit = scope.options.canEdit ? true : false;

        scope.model = _.isArray(scope.model) ? scope.model : [];
        scope.breadcrumbs = [];

        var tree = new Tree(scope.treeNodes, scope.template);

        scope.load = function(node) {
          scope.onlySelected = false;
          if(tree.isValidNode(node)) {
            tree.setCurrentNodes(node[tree.template.nodes]);
            scope.breadcrumbs = tree.breadcrumbs(node[tree.template.id]);
          } else {
            tree.setCurrentNodes();
            scope.breadcrumbs = [];
          }
        };

        scope.select = function(node) {
          if(node[tree.template.id]) {
            scope.model.push(node[tree.template.id]);
          }
        };

        scope.deselect = function(node) {
          var index = node[tree.template.id] ? _.indexOf(scope.model,node[tree.template.id]) : -1;
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
            tree.setCurrentNodes(tree.getNodesInPath());
          } else {
            scope.onlySelected = true;
            var selected = tree.findSelected(scope.model);
            tree.setNodesInPath(tree.nodes);
            tree.setCurrentNodes(selected);
          }
        };

        scope.tree = tree;

        scope.load();

        /* Handle adding and editing nodes */
        scope.toggleEditing = function() {
          scope.isEditing = !scope.isEditing;
        };

        scope.addNode = function(node) {
          if(tree.isValidNode(node)) {
            scope.load(node);
          }
          scope.options.addNode.call(scope,tree.nodes);
        };

        scope.remove = function(node) {
          var index = node ? _.indexOf(tree.nodes, node) : -1;
          if(index !== -1) {
            tree.nodes.splice(index, 1);
          }
        };
      }
    };

  }

  sequoiaTreeDirective.$inject = ['SequoiaTree'];

  angular.module('ngSequoia')
    .directive('sequoiaTree', sequoiaTreeDirective);

})();