angular-sequoia
=============================

A native tree visualiser for AngularJS with multiselect, breadcrumbs and search. No JQuery.

[![Build Status](https://travis-ci.org/tricinel/angular-sequoia.svg)](https://travis-ci.org/tricinel/angular-sequoia)

#### Features:

* Visualize multi-level trees
* Breadcrumbs
* Deep search for the tree
* Select/Remove items
* Show/hide selected items

##### Usage:

Get the binaries of angular-multi-select-tree with any of the following ways.

```sh
bower install angular-sequoia --save
```

Make sure to load the scripts in your html.
```html
<link rel="stylesheet" href="../dist/angular-sequoia.css">
<script type="text/javascript" src="../dist/angular-sequoia.js"></script>
```

And Inject the sortable module as dependency.

```
angular.module('myApp', ['ngSequoia']);
```

###### Html Structure:
You can also check out the [demo](./demo) folder.

```javascript
function MainController() {
  var vm = this;

  vm.selectedNodes = [];

  vm.template = {
    id: '_id',
    nodes: 'nodes',
    title: 'title'
  };

  vm.tree = [
    {
      _id: '123412341234',
      title: 'Title one',
      nodes: [
        {
          _id: '2342346234',
          title: 'Subtitle one',
          nodes: [...]
        }
      ]
    }
  ];
}
```

```html
<div data-ng-controller="MainController as vm">
  <div data-sequoia-tree="vm.tree" data-ng-model="vm.selectedNodes" data-node-template="vm.template"></div>
</div>
```

You can ignore the `vm.template` as long as your nodes conform to the _id, nodes, title template. Otherwise, just pass it through.

```javascript
vm.template = {
  id: 'key',
  nodes: 'categories',
  title: 'name'
};
```

##### Coming next

* Better visualiser for long titles
* Add new nodes on the fly to the tree/subtree
* Remove nodes on the fly from the tree/subtree

##### License

MIT, see [LICENSE.md](./LICENSE.md).
