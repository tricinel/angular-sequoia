(function() {
  'use strict';

  function sequoiaTreeDirective(Tree, BUTTONS, DEFAULT_OPTIONS, SORTABLE_OPTIONS){

    return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'angular-sequoia.html',
      scope: {
        'treeNodes': '=sequoiaTree',
        'model': '=?ngModel',
        'template': '=?nodeTemplate',
        'options': '=?',
        'path': '=?sequoiaTreePath'
      },
      link: function(scope) {
        function init() {
          /* Set the default options*/
          scope.options = _.defaults(scope.options || {}, DEFAULT_OPTIONS);
          scope.canEdit = scope.options.canEdit;
          scope.inline = scope.options.inline;
          scope.allowSelect = scope.options.allowSelect;
          scope.isMultiSelect = scope.options.limit === 1 ? false : true;
          scope.model = scope.isMultiSelect ? _.isArray(scope.model) ? scope.model : [] : _.isString(scope.model) ? scope.model : '';
          scope.breadcrumbs = [];
          scope.buttons = _.defaults(scope.options.buttons, BUTTONS);
          scope.sortableOptions = SORTABLE_OPTIONS;
          scope.tree = new Tree(angular.copy(scope.treeNodes), scope.template, scope.buttons);
        }

        scope.load = function(node) {
          scope.onlySelected = false;

          var n = node ? node : scope.path ? scope.path : null;

          if(scope.tree.isValidNode(n)) {
            scope.tree.setCurrentNodes(n[scope.tree.template.nodes]);
            scope.breadcrumbs = scope.tree.breadcrumbs(n[scope.tree.template.id]);
            scope.path = n;
            scope.parentNode = scope.tree.findParentNode(scope.breadcrumbs);
          } else {
            scope.tree.setCurrentNodes();
            scope.breadcrumbs = [];
            scope.parentNode = null;
            scope.path = null;
          }

          scope.tree.paginate();
        };

        scope.loadMore = function() {
          scope.tree.paginate();
        };

        scope.select = function(node) {
          if(node[scope.tree.template.id]) {
            if(scope.options.limit !== 0 && scope.model.length === scope.options.limit) {
              scope.notification = 'You cannot select more than ' + scope.options.limit + ' items!';
            } else {
              if(scope.isMultiSelect) {
                scope.model.push(node[scope.tree.template.id]);
              } else {
                scope.model = node[scope.tree.template.id];
              }
            }
          }
        };

        scope.deselect = function(node) {
          if(scope.isMultiSelect) {
            var index = node[scope.tree.template.id] ? _.indexOf(scope.model,node[scope.tree.template.id]) : -1;
            if(index !== -1) {
              scope.model.splice(index, 1);
            }
          } else {
            scope.model = '';
          }

        };

        scope.deselectAll = function() {
          scope.model = scope.isMultiSelect ? [] : '';
        };

        scope.isSelected = function(node) {
          return scope.isMultiSelect ? _.indexOf(scope.model, node[scope.tree.template.id]) !== -1 ? true : false : scope.model === node[scope.tree.template.id];
        };

        scope.toggleSelected = function() {
          if(scope.onlySelected) {
            scope.onlySelected = false;
            scope.tree.setCurrentNodes(scope.tree.getNodesInPath());
          } else {
            scope.onlySelected = true;
            var selected = scope.tree.findSelected(scope.model);
            scope.tree.setNodesInPath(scope.tree.nodes);
            scope.tree.setCurrentNodes(selected);
          }

          scope.tree.paginate();
        };

        init();

        scope.$watch('treeNodes', function(newVal) {
          if(newVal) {
            scope.tree = new Tree(angular.copy(scope.treeNodes), scope.template, scope.buttons);
            scope.load();
          }
        });

        scope.$watchCollection('path', function(newVal) {
          if(newVal) {
            scope.load();
          }
        });

        if(!scope.inline) {
          scope.load();
        }

        /* Handle Modal */
        scope.showModal = function() {
          scope.load();
          scope.modalShown = true;
        };

        scope.closeModal = function() {
          scope.modalShown = false;
        };

        /* Handle adding and editing nodes */
        scope.toggleEditing = function(form) {
          //handle form validation
          if(scope.isEditing) {
            form.isSubmitted = true;
          }
          if(form && !form.$valid) {
            return;
          }

          scope.treeNodes = angular.copy(scope.tree.tree);

          scope.isEditing = !scope.isEditing;
        };

        scope.addNode = function(node) {
          if(scope.tree.isValidNode(node)) {
            scope.load(node);
          }

          scope.tree.addNode();
          scope.tree.paginate();

          scope.isEditing = true;
        };

        scope.remove = function(node) {
          scope.tree.removeNode(node);
          scope.tree.paginate();
        };

        scope.closeNotification = function() {
          scope.notification = '';
        };
      }
    };

  }

  sequoiaTreeDirective.$inject = ['SequoiaTree', 'BUTTONS', 'DEFAULT_OPTIONS', 'SORTABLE_OPTIONS'];

  angular.module('ngSequoia')
    .directive('sequoiaTree', sequoiaTreeDirective);

})();