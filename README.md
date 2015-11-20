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

  vm.treeOptions = {
    canEdit: true,
    buttons:  {
      done: 'Complete'
    },
    addNode: function(nodes) {
      var id = Math.floor((Math.random() * 10000) + 1);
      nodes.push({
        _id: id,
        title: 'Title ' + id,
        nodes: []
      });
    }
  };
}
```

```html
<div data-ng-controller="MainController as vm">
  <div data-sequoia-tree="vm.tree" data-ng-model="vm.selectedNodes" data-node-template="vm.template" data-options="vm.treeOptions"></div>
</div>
```

You can ignore the `vm.template` as long as your nodes conform to the default template (which you can find here: [default template](./src/sequoia.constants.js)). Otherwise, just pass it through.

```javascript
vm.template = {
  id: 'key',
  nodes: 'categories',
  title: 'name'
};
```

By `passing canEdit = true` via `vm.treeOptions` you are basically turning your tree visualiser into a tree editor. You can add new nodes or remove and edit existing nodes.

You can configure all the button texts and even pass in icons for buttons. You don't need to configure all, just the ones that you need. You can find the default buttons here: [default buttons](./src/sequoia.constants.js)

##### Coming next

* Better visualiser for long titles
* Drag and drop support when in edit mode
* Infinite scroll for the nodes on any level

##### License

MIT, see [LICENSE.md](./LICENSE.md).
