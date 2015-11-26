(function() {
  'use strict';

  var buttons = {
    edit: 'Edit',
    select: 'Select',
    deselect: 'Deselect',
    goToSubitems: 'Go to subitems',
    addSubitems: 'Add subitems',
    addNode: 'Add node',
    remove: 'Delete',
    done: 'Done',
    searchClear: '&times;',
    showSelected: 'Show selected',
    hideSelected: 'Hide selected',
    backToList: 'Back to list',
    move: 'Move'
  };

  var nodeTemplate = {
    id: '_id',
    nodes: 'nodes',
    title: 'title'
  };

  angular.module('ngSequoia')
    .constant('BUTTONS', buttons)
    .constant('NODE_TEMPLATE', nodeTemplate);

})();
