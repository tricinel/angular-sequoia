(function() {
  'use strict';

  angular.module('ngSequoia', ['angular-lodash']);

})();

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
        'template': '=nodeTemplate'
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

        scope.load();
      }
    };

  }

  sequoiaTreeDirective.$inject = ['SequoiaTree'];

  angular.module('ngSequoia')
    .directive('sequoiaTree', sequoiaTreeDirective);

})();
(function() {
  'use strict';

  function SequoiaTree($log) {

    var _checkNodeStructure, _exists, _contains, _buildBreadCrumbs, _buildPath, _selected, _createNodeWithFullPathAsTitle;

    var SequoiaTree = function(tree, template) {
      var nodeTemplate = {
        id: '_id',
        nodes: 'nodes',
        title: 'title'
      };

      this.template = template || nodeTemplate;
      this.tree = _checkNodeStructure(_.isArray(tree) ? tree[0] : [], this.template) ? tree : [];
    };

    _checkNodeStructure = function(node, template) {
      var keys = _.values(template);
      for(var i=0;i<keys.length;i++) {
        if (!_.has(node, keys[i])) {
          $log.warn('The node structure is not valid!');
          return false;
        }
      }

      return true;
    };

    _exists = function (nodes, key, value, template) {
      if (_.isArray(nodes)) {
        return _.some(nodes, function(node){
          return node[key] === value ? true : _exists(node[template.nodes], key, value, template);
        });
      } else {
        return false;
      }
    };

    _contains = function (nodes, key, value, results, template) {
      if (_.isArray(nodes)) {
        for(var i=0;i<nodes.length;i++) {
          if(nodes[i][key].toLowerCase().indexOf(value.toLowerCase()) > -1) {
            results.push(nodes[i]);
          }
          _contains(nodes[i][template.nodes], key, value, results, template);
        }
      }

      return results;
    };

    _buildBreadCrumbs = function(id, nodes, breadcrumbs, template) {
      nodes = nodes || [];
      var root = {};
      root[template.title] = 'Root';
      breadcrumbs = !breadcrumbs.length ? [root] : breadcrumbs;

      for(var i=0;i<nodes.length;i++) {
        if(nodes[i][template.id] === id || _exists(nodes[i][template.nodes], template.id, id, template)) {
          breadcrumbs.push(nodes[i]);
        }
        _buildBreadCrumbs(id, nodes[i][template.nodes], breadcrumbs, template);
      }

      return breadcrumbs;
    };

    _buildPath = function(node, nodes, path, template) {
      nodes = nodes || [];

      for(var i=0;i<nodes.length;i++) {
        if(nodes[i][template.id] === node[template.id] || _exists(nodes[i][template.nodes], template.id, node[template.id], template)) {
          path += path.length ? ' > ' : '';
          path += _.trunc(nodes[i][template.title], 20);
        }
        path = _buildPath(node, nodes[i][template.nodes], path, template);
      }

      return path;
    };

    _selected = function(id, nodes, selected, template) {
      if(_.isArray(nodes)) {
        for(var i=0;i<nodes.length;i++) {
          if(nodes[i]._id === id) {
            selected.push(nodes[i]);
          }
          _selected(id, nodes[i][template.nodes], selected, template);
        }
      }

      return selected;
    };

    _createNodeWithFullPathAsTitle = function(node, tree, template) {
      var result = {};

      result[template.id] = node[template.id];
      result[template.title] = _buildPath(node, tree, '', template);

      return result;
    };

    SequoiaTree.prototype.setCurrentNodes = function(nodes) {
      this.nodes = !_.isArray(nodes) ? this.tree : nodes;
    };

    SequoiaTree.prototype.isValidNode = function(node) {
      return _.isObject(node) && node[this.template.nodes];
    };

    SequoiaTree.prototype.breadcrumbs = function(id) {
      return _buildBreadCrumbs(id,this.tree,[], this.template);
    };

    SequoiaTree.prototype.find = function(key,value) {
      var results = [],
          found = _contains(this.tree, key, value, [], this.template);
      for(var i=0;i<found.length;i++) {
        results.push(_createNodeWithFullPathAsTitle(found[i], this.tree,this.template));
      }

      return results;
    };

    SequoiaTree.prototype.findSelected = function(ids) {
      var selected = [],
          results = [];

      if(_.isArray(ids)) {
        for(var i=0;i<ids.length;i++) {
          selected = _.union(selected, _selected(ids[i], this.tree, [], this.template));
        }

        for(var i=0;i<selected.length;i++) {
          results.push(_createNodeWithFullPathAsTitle(selected[i], this.tree,this.template));
        }
      } else {
        $log.warn('You must pass an array of IDs in order to find the selected nodes!');
      }

      return results;
    };

    return SequoiaTree;
  }

  SequoiaTree.$inject = ['$log'];

  angular.module('ngSequoia')
    .factory('SequoiaTree', SequoiaTree);

})();

angular.module("ngSequoia").run(["$templateCache", function($templateCache) {$templateCache.put("angular-sequoia.html","<div class=\"sequoia\" data-ng-show=\"tree.tree.length\">\n\n  <div class=\"sequoia-search\">\n    <div class=\"sequoia-search-form\" data-sequoia-search data-is-searching=\"searchEnabled\" data-tree=\"tree\"></div>\n    <div class=\"sequoia-actions\" data-ng-if=\"model.length\">\n      <ul>\n        <li><a class=\"sequoia-button sequoia-button-info\" href=\"\" data-ng-click=\"toggleSelected()\">{{onlySelected ? \'Hide selected\' : \'Show selected\'}}</a></li>\n      </ul>\n    </div>\n  </div>\n\n  <ul data-ng-if=\"!searchEnabled && !onlySelected\" class=\"sequoia-breadcrumbs\" data-ng-include=\"\'sequoia-breadcrumbs.html\'\"></ul>\n\n  <ul class=\"sequoia-tree\">\n    <li data-ng-repeat=\"node in tree.nodes track by node[tree.template.id]\">\n      <span class=\"sequoia-item-title\" data-ng-bind=\"node[tree.template.title]\"></span>\n      <span class=\"sequoia-item-actions\">\n        <span data-ng-if=\"isSelected(node)\">\n          <a class=\"sequoia-button sequoia-button-danger\" href=\"\" title=\"Remove\" data-ng-click=\"remove(node)\">Remove</a>\n        </span>\n        <span data-ng-if=\"!isSelected(node)\">\n          <a class=\"sequoia-button sequoia-button-primary\" href=\"\" title=\"Select\" data-ng-click=\"select(node)\">Select</a>\n        </span>\n        <span data-ng-if=\"node[tree.template.nodes]\">\n          <a class=\"sequoia-button sequoia-button-info\" href=\"\" title=\"Go to subitems\" data-ng-click=\"load(node)\">Go to subitems</a>\n        </span>\n      </span>\n    </li>\n  </ul>\n</div>\n");
$templateCache.put("sequoia-breadcrumbs.html","<li data-ng-if=\"breadcrumbs.length\" data-ng-repeat=\"link in breadcrumbs\" data-ng-class=\"$last ? \'last\' : \'\'\" data-ng-init=\"title = link[tree.template.title].length > 23 ? (link[tree.template.title] | limitTo:20) + \'&hellip;\' : link[tree.template.title]\">\n  <a data-ng-if=\"!$last\" href=\"\" data-ng-click=\"load(link)\" data-ng-bind=\"title\"></a>\n  <span data-ng-if=\"$last\" data-ng-bind=\"title\"></span>\n</li>");
$templateCache.put("sequoia-search.html","<form data-ng-submit=\"search()\">\n  <input type=\"text\" placeholder=\"Search for an item by {{tree.template.title}}\" data-ng-model=\"query\" name=\"search\" />\n  <a class=\"sequoia-button sequoia-button-default\" href=\"\" data-ng-if=\"isSearching\" data-ng-click=\"clear()\">&times;</a>\n</form>\n");}]);