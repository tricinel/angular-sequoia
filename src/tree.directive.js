(function() {
  'use strict';

  function sequoiaTreeDirective(Tree, BUTTONS, DEFAULT_OPTIONS){

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
        function init() {
          /* Set the default options*/
          scope.options = _.defaults(scope.options || {}, DEFAULT_OPTIONS);
          scope.canEdit = scope.options.canEdit;
          scope.inline = scope.options.inline;
          scope.allowSelect = scope.options.allowSelect;
          scope.isMultiSelect = scope.options.limit === 1 ? false : true;
          scope.model = scope.isMultiSelect ? _.isArray(scope.model) ? scope.model : [] : _.isString(scope.model) ? scope.model : '';
          scope.breadcrumbs = [];
          scope.tree = new Tree(angular.copy(scope.treeNodes), scope.template);
          scope.buttons = {
            edit: scope.options.buttons.edit ? scope.options.buttons.edit : BUTTONS.edit,
            select: scope.options.buttons.select ? scope.options.buttons.select : BUTTONS.select,
            deselect: scope.options.buttons.deselect ? scope.options.buttons.deselect : BUTTONS.deselect,
            goToSubitems: scope.options.buttons.goToSubitems ? scope.options.buttons.goToSubitems : BUTTONS.goToSubitems,
            addSubitems: scope.options.buttons.addSubitems ? scope.options.buttons.addSubitems : BUTTONS.addSubitems,
            addNode: scope.options.buttons.addNode ? scope.options.buttons.addNode : BUTTONS.addNode,
            remove: scope.options.buttons.remove ? scope.options.buttons.remove : BUTTONS.remove,
            done: scope.options.buttons.done ? scope.options.buttons.done : BUTTONS.done,
            search: scope.options.buttons.search ? scope.options.buttons.search : BUTTONS.search,
            searchClear: scope.options.buttons.searchClear ? scope.options.buttons.searchClear : BUTTONS.searchClear,
            showSelected: scope.options.buttons.showSelected ? scope.options.buttons.showSelected : BUTTONS.showSelected,
            hideSelected: scope.options.buttons.hideSelected ? scope.options.buttons.hideSelected : BUTTONS.hideSelected,
            backToList: scope.options.buttons.backToList ? scope.options.buttons.backToList : BUTTONS.backToList,
            move: scope.options.buttons.move ? scope.options.buttons.move : BUTTONS.move,
            modalSelect: scope.options.buttons.modalSelect ? scope.options.buttons.modalSelect : BUTTONS.modalSelect
          };
        }

        scope.load = function(node) {
          scope.onlySelected = false;
          if(scope.tree.isValidNode(node)) {
            scope.tree.setCurrentNodes(node[scope.tree.template.nodes]);
            scope.breadcrumbs = scope.tree.breadcrumbs(node[scope.tree.template.id]);
          } else {
            scope.tree.setCurrentNodes();
            scope.breadcrumbs = [];
          }
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
        };

        init();

        scope.$watch('treeNodes', function(newVal) {
          if(newVal) {
            scope.tree = new Tree(angular.copy(scope.treeNodes), scope.template);
            scope.load();
          }
        }, true);

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

          scope.tree.nodes.push(scope.tree.newNode());
          scope.isEditing = true;
        };

        scope.remove = function(node) {
          var index = node ? _.indexOf(scope.tree.nodes, node) : -1;
          if(index !== -1) {
            scope.tree.nodes.splice(index, 1);
          }
        };

        scope.closeNotification = function() {
          scope.notification = '';
        };
      }
    };

  }

  sequoiaTreeDirective.$inject = ['SequoiaTree', 'BUTTONS', 'DEFAULT_OPTIONS'];

  angular.module('ngSequoia')
    .directive('sequoiaTree', sequoiaTreeDirective);

})();