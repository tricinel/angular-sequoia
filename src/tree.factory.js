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
