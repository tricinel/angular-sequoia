(function() {
  'use strict';

  function sequoiaTreeDirective(Tree, Utils, BUTTONS, DEFAULT_OPTIONS, SORTABLE_OPTIONS){

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
      link: function (scope) {
        function handleSort(evt) {
          if(scope.breadcrumbs.path.length) {
            scope.treeNodes = Utils.updateNodesInPath(scope.treeNodes, scope.breadcrumbs.path, evt.models, scope.tree.template.nodes);
          } else {
            scope.treeNodes = evt.models;
          }
        }

        function init() {
          /* Set the default options*/
          scope.options = _.defaults(scope.options || {}, DEFAULT_OPTIONS);
          scope.canEdit = scope.options.canEdit;
          scope.inline = scope.options.inline;
          scope.allowSelect = scope.options.allowSelect;
          scope.isMultiSelect = scope.options.limit === 1 ? false : true;
          scope.breadcrumbs = { path: '', nodes: [] };
          scope.buttons = _.defaults(scope.options.buttons, BUTTONS);
          scope.sortableOptions = _.assign({}, SORTABLE_OPTIONS, { onSort: handleSort });
          scope.tree = new Tree(scope.treeNodes, scope.template, scope.buttons);

          scope.model = Utils.setModel(scope.isMultiSelect, scope.model);

          scope.containerStyle = !scope.inline ? { 'overflow': 'scroll', 'max-height': '400px' } : {};

          scope._cachedNode = null;
        }

        function paginate() {
          scope.tree.paginate();
          scope.finished = scope.tree.pagination.finished;
        }

        scope.load = function(node) {
          scope.onlySelected = false;

          var n = node ? node : scope.path ? scope.path : null;

          if (n && scope._cachedNode) {
            // We need to make sure the node has children
            n = Utils.ensureChildren(n, this.template);
            scope._cachedNode = null;
          }

          if(scope.tree.isValidNode(n)) {
            scope.tree.setCurrentNodes(n[scope.tree.template.nodes]);
            scope.breadcrumbs = scope.tree.breadcrumbs(n[scope.tree.template.id]);
            scope.path = n;
            scope.parentNode = scope.tree.findParentNode(scope.breadcrumbs.nodes);
          } else {
            scope.tree.setCurrentNodes();
            scope.breadcrumbs = { path: '', nodes: [] };
            scope.parentNode = null;
            scope.path = null;
          }

          scope.tree.resetPagination();
          paginate();
          scope.$emit('nodes:updated');
        };

        scope.loadMore = function() {
          paginate();
        };

        scope.select = function(node) {
          //make sure that scope.model is setup
          if(_.isUndefined(scope.model)) {
            scope.model = Utils.setModel(scope.isMultiSelect, scope.model);
          }

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
            scope.load();
          } else {
            scope.onlySelected = true;
            var selected = scope.tree.findSelected(scope.model);
            scope.tree.setNodesInPath(scope.tree.nodes);
            scope.tree.setCurrentNodes(selected);
            scope.tree.resetPagination();
            paginate();
          }
        };

        init();

        scope.$watchCollection('treeNodes', function(newVal) {
          if(newVal) {
            scope.tree = new Tree(scope.treeNodes, scope.template, scope.buttons);
            scope.load();
          }
        });

        scope.$watchCollection('path', function (newVal) {
          if (newVal) {
            scope.load(scope._cachedNode);
          }
        });

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

          scope.treeNodes = scope.tree.tree;

          scope.isEditing = !scope.isEditing;
        };

        scope.addNode = function (node) {

          if (typeof node !== 'undefined') {
            // Because of the pruneTree function, we are removing the subnodes when we remove the last ever node, so we need to make sure it is still there when we add a new node
            node = Utils.ensureChildren(node, this.template);
          }

          if(scope.tree.isValidNode(node)) {
            scope.load(node);
          }

          scope.tree.addNode();
          paginate();

          scope.isEditing = true;
        };

        scope.remove = function (node) {
          node = Utils.ensureChildren(node, this.template);
          var parentNodeIsRoot = scope.breadcrumbs.nodes.length > 2;
          var hasSiblings = node[scope.tree.template.nodes].length > 0;

          if (!hasSiblings && parentNodeIsRoot) {
            scope._cachedNode = scope.tree.findParentNode(scope.breadcrumbs.nodes);
          }

          scope.tree.removeNode(node);
        };

        scope.closeNotification = function() {
          scope.notification = '';
        };
      }
    };

  }

  sequoiaTreeDirective.$inject = ['SequoiaTree', 'SequoiaTreeUtils', 'BUTTONS', 'DEFAULT_OPTIONS', 'SORTABLE_OPTIONS'];

  angular.module('ngSequoia')
    .directive('sequoiaTree', sequoiaTreeDirective);

})();
