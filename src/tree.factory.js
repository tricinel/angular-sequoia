(function() {
  'use strict';

  function SequoiaTreeFactory($log, NODE_TEMPLATE, BUTTONS) {

    var _checkNodeStructure, _exists, _contains, _buildBreadCrumbs, _buildPath, _selected, _createNodeWithFullPathAsTitle, _guid, _getParentNode, _pruneTree;

    var SequoiaTree = function(tree, template, buttons) {
      this.template = template || NODE_TEMPLATE;
      this.tree = _checkNodeStructure(_.isArray(tree) ? tree[0] : {}, this.template) ? tree : [];
      this.pagination = {
        startkey: 0,
        limit: 20,
        finished: false
      };
      this.buttons = buttons || BUTTONS;
    };

    _guid = function() {
      // https://gist.github.com/jed/982883
      var b = function(a) {return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);}; // jshint ignore:line

      return b();
    };

    _checkNodeStructure = function(node, template) {
      if(!node) {
        return false;
      }

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

    _buildBreadCrumbs = function(id, nodes, breadcrumbs, template, rootText) {
      nodes = nodes || [];
      var root = {};
      root[template.title] = rootText;
      breadcrumbs = !breadcrumbs.length ? [root] : breadcrumbs;

      for(var i=0;i<nodes.length;i++) {
        if(nodes[i][template.id] === id || _exists(nodes[i][template.nodes], template.id, id, template)) {
          breadcrumbs.push(nodes[i]);
        }
        _buildBreadCrumbs(id, nodes[i][template.nodes], breadcrumbs, template, rootText);
      }

      return breadcrumbs;
    };

    _buildPath = function(node, nodes, path, template, rootText) {
      nodes = nodes || [];

      for(var i=0;i<nodes.length;i++) {
        if(nodes[i][template.id] === node[template.id] || _exists(nodes[i][template.nodes], template.id, node[template.id], template)) {
          path += path.length ? ' » ' : 'Full path: ' + rootText + ' » ';
          path += nodes[i][template.title];
        }
        path = _buildPath(node, nodes[i][template.nodes], path, template, rootText);
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

    _getParentNode = function(id, nodes, template, breadcrumbs) {
      nodes = nodes || [];

      breadcrumbs = breadcrumbs || [];

      for(var i=0;i<nodes.length;i++) {
        if(nodes[i][template.id] === id || _exists(nodes[i][template.nodes], template.id, id, template)) {
          breadcrumbs.push(nodes[i]);
        }
        _getParentNode(id, nodes[i][template.nodes], template, breadcrumbs);
      }

      return breadcrumbs;
    };

    _createNodeWithFullPathAsTitle = function(node, tree, template, rootText) {
      var result = {};

      result[template.id] = node[template.id];
      result[template.title] = node[template.title];
      /* This is a bit hacky, will fix */
      result.fullpath = '<span class="help-text mute">' + _buildPath(node, tree, '', template, rootText) + '</span>';
      if(_.isArray(node[template.nodes]) && node[template.nodes].length > 0) {
        result[template.nodes] = node[template.nodes];
      }

      return result;
    };

    _pruneTree = function(nodes, id, template) {
      for (var i=0;i<nodes.length;i++) {
        var node = nodes[i];
        if (node[template.id] === id) {
          nodes.splice(i, 1);
          return nodes;
        }
        if (node[template.nodes]) {
          if (_pruneTree(node[template.nodes], id, template)) {
            if (node[template.nodes].length === 0) {
              delete node[template.nodes];
            }
            return nodes;
          }
        }
      }
    };

    SequoiaTree.prototype.findParentNode = function(path) {
      return _.last(_.dropRight(path));
    };

    SequoiaTree.prototype.buildPathToNode = function(node) {
      return _buildPath(node, this.tree, '', this.template, this.buttons.root);
    };

    SequoiaTree.prototype.paginate = function() {
      var paginate = function(nodes, limit, startkey) {
          return nodes.length > limit ? nodes.slice(startkey, startkey + limit) : nodes;
        },
        append = paginate(this.currentNodes, this.pagination.limit, this.pagination.startkey);

      //set the new startkey
      this.pagination.startkey = _.indexOf(this.currentNodes, _.last(append));

      //set the new nodes
      this.nodes = _.union(this.nodes, append);

      //have we reached the end of the array?
      if(this.nodes.length === this.tree.length) {
        this.pagination.finished = true;
      }
    };

    SequoiaTree.prototype.setCurrentNodes = function(nodes) {
      this.nodes = [];
      this.pagination.startkey = 0;
      this.currentNodes = !_.isArray(nodes) ? this.tree : nodes;
    };

    SequoiaTree.prototype.setNodesInPath = function(nodes) {
      this.nodesInPath = !_.isArray(nodes) ? this.tree : nodes;
    };

    SequoiaTree.prototype.getNodesInPath = function() {
      return _.isArray(this.nodesInPath) ? this.nodesInPath : this.tree;
    };

    SequoiaTree.prototype.isValidNode = function(node) {
      return _.isObject(node) && node[this.template.nodes];
    };

    SequoiaTree.prototype.breadcrumbs = function(id) {
      return _buildBreadCrumbs(id,this.tree,[], this.template, this.buttons.root);
    };

    SequoiaTree.prototype.find = function(key,value) {
      var results = [],
          found = _contains(this.tree, key, value, [], this.template);
      for(var i=0;i<found.length;i++) {
        results.push(_createNodeWithFullPathAsTitle(found[i], this.tree,this.template, this.buttons.root));
      }

      return results;
    };

    SequoiaTree.prototype.findSelected = function(obj) {
      var selected = [],
          results = [];

      if(_.isArray(obj)) {
        for(var i=0;i<obj.length;i++) {
          selected = _.union(selected, _selected(obj[i], this.tree, [], this.template));
        }

        for(var j=0;j<selected.length;j++) {
          results.push(_createNodeWithFullPathAsTitle(selected[j], this.tree,this.template, this.buttons.root));
        }
      } else if(_.isString(obj)) {
        selected = _selected(obj, this.tree, [], this.template);
        results.push(_createNodeWithFullPathAsTitle(selected[0], this.tree, this.template, this.buttons.root));
      } else {
        $log.warn('You must pass an array of IDs or a single ID in order to find the selected nodes!');
      }

      return results;
    };

    SequoiaTree.prototype.addNode = function() {
      var node = {};

      node[this.template.id] = _guid();
      node[this.template.title] = '';
      node[this.template.nodes] = [];

      this.currentNodes.push(node);
    };

    SequoiaTree.prototype.removeNode = function(node) {
      //remove node from nodes currently visible
      this.currentNodes = _.without(this.currentNodes, node);
      this.nodes = _.without(this.nodes, node);
      //remove node from the tree, search recursively
      this.tree = _pruneTree(this.tree, node[this.template.id], this.template);
    };

    return SequoiaTree;
  }

  SequoiaTreeFactory.$inject = ['$log', 'NODE_TEMPLATE', 'BUTTONS'];

  angular.module('ngSequoia')
    .factory('SequoiaTree', SequoiaTreeFactory);

})();
