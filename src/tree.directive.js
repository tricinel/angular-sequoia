(function() {
  'use strict';

  function sequoiaTreeDirective(Tree, BUTTONS){

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
          scope.options = _.defaults(scope.options, {canEdit: false, useModal: false, buttons: {}});
          scope.canEdit = scope.options.canEdit;
          scope.useModal = scope.options.useModal;
          scope.allowSelect = scope.model ? true : false;
          scope.model = _.isArray(scope.model) ? scope.model : [];
          scope.breadcrumbs = [];
          scope.tree = new Tree(scope.treeNodes, scope.template);
          scope.buttons = {
            edit: scope.options.buttons.edit ? scope.options.buttons.edit : BUTTONS.edit,
            select: scope.options.buttons.select ? scope.options.buttons.select : BUTTONS.select,
            deselect: scope.options.buttons.deselect ? scope.options.buttons.deselect : BUTTONS.deselect,
            goToSubitems: scope.options.buttons.goToSubitems ? scope.options.buttons.goToSubitems : BUTTONS.goToSubitems,
            addSubitems: scope.options.buttons.addSubitems ? scope.options.buttons.addSubitems : BUTTONS.addSubitems,
            addNode: scope.options.buttons.addNode ? scope.options.buttons.addNode : BUTTONS.addNode,
            remove: scope.options.buttons.remove ? scope.options.buttons.remove : BUTTONS.remove,
            done: scope.options.buttons.done ? scope.options.buttons.done : BUTTONS.done,
            searchClear: scope.options.buttons.searchClear ? scope.options.buttons.searchClear : BUTTONS.searchClear,
            showSelected: scope.options.buttons.showSelected ? scope.options.buttons.showSelected : BUTTONS.showSelected,
            hideSelected: scope.options.buttons.hideSelected ? scope.options.buttons.hideSelected : BUTTONS.hideSelected,
            backToList: scope.options.buttons.backToList ? scope.options.buttons.backToList : BUTTONS.backToList
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
            scope.model.push(node[scope.tree.template.id]);
          }
        };

        scope.deselect = function(node) {
          var index = node[scope.tree.template.id] ? _.indexOf(scope.model,node[scope.tree.template.id]) : -1;
          if(index !== -1) {
            scope.model.splice(index, 1);
          }
        };

        scope.isSelected = function(node) {
          return _.indexOf(scope.model, node[scope.tree.template.id]) !== -1 ? true : false;
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

        if(!scope.useModal) {
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
          console.log(form);
          //handle form validation
          if(scope.isEditing) {
            form.isSubmitted = true;
          }
          if(form && !form.$valid) {
            return;
          }

          scope.isEditing = !scope.isEditing;
          if(scope.isEditing) {
            scope.allowSelect = false;
          }
        };

        scope.addNode = function(node) {
          if(scope.tree.isValidNode(node)) {
            scope.load(node);
          }

          scope.tree.nodes.push(scope.tree.newNode());
          scope.treeNodes = angular.copy(scope.tree.tree);
          scope.allowSelect = false;
          scope.isEditing = true;
        };

        scope.remove = function(node) {
          var index = node ? _.indexOf(scope.tree.nodes, node) : -1;
          if(index !== -1) {
            scope.tree.nodes.splice(index, 1);
          }
        };
      }
    };

  }

  sequoiaTreeDirective.$inject = ['SequoiaTree', 'BUTTONS'];

  angular.module('ngSequoia')
    .directive('sequoiaTree', sequoiaTreeDirective);

})();