'use strict';

describe('Sequoia Tree Factory', function() {

  var node, template, wrongTemplate, nodes;

  node = { _id: '1234', title: 'My title', nodes: [] };
  template = { id: '_id', title: 'title', nodes: 'nodes' };
  wrongTemplate = { id: 'not_id', title: 'title', nodes: 'nodes' };
  nodes = [
    { _id: '1234', title: 'Title one', nodes: [] },
    { _id: '5678', title: 'Title two', nodes: [] },
    { _id: '9012', title: 'Title three', nodes: [{ _id: '3456', title: 'Subtitle one', nodes: [] }, { _id: '7890', title: 'Subtitle two', nodes: [{ _id: '12345', title: 'Subsubtitle one', nodes: [] }] }] }
  ];

  beforeEach(module('ngSequoia'));

  var SequoiaTree,
      log;

  beforeEach(inject(function(_SequoiaTree_, _$log_){
    SequoiaTree = _SequoiaTree_;
    log = _$log_;
  }));

  it('should create a new tree', function() {
    var tree = new SequoiaTree(nodes,template);

    expect(tree).toBeDefined();
  });

  it('should validate the node template', function() {
    var tree = new SequoiaTree(nodes,template);

    expect(tree.tree.length).toBeTruthy();
  });

  it('should not validate the node template', function() {
    var tree = new SequoiaTree(nodes,wrongTemplate);

    expect(tree.tree.length).toBeFalsy();
  });

  it('should validate a node', function() {
    var tree = new SequoiaTree([],template);

    expect(tree.isValidNode(node)).toBeTruthy();
  });

  it('should set the current nodes to the tree nodes', function() {
    var tree = new SequoiaTree(nodes,template);

    tree.setCurrentNodes();
    expect(tree.nodes).toEqual(nodes);
  });

  it('should set the current nodes to passed nodes', function() {
    var someNodes = [{_id: '1234', title: 'Title', nodes: []}],
        tree = new SequoiaTree(nodes,template);

    tree.setCurrentNodes(someNodes);
    expect(tree.nodes).toEqual(someNodes);
  });

  it('should find elements containing a string in the title', function() {
    var tree = new SequoiaTree(nodes,template),
        found = tree.find('title', 'sub');

    expect(found.length).toBe(3);
  });

  it('should find selected items', function() {
    var tree = new SequoiaTree(nodes,template),
        ids = ['1234', '5678', '12345', 'wrong_id'],
        found = tree.findSelected(ids);

    expect(found.length).toBe(3);
  });

  it('create breadcrumbs', function() {
    var tree = new SequoiaTree(nodes,template),
        breadcrumbs = [{ title: 'Root' },{ _id: '9012', title: 'Title three', nodes: [{ _id: '3456', title: 'Subtitle one', nodes: []}, { _id: '7890', title: 'Subtitle two', nodes: [{ _id: '12345', title: 'Subsubtitle one', nodes: []}]}]}, { _id: '7890', title: 'Subtitle two', nodes: [{ _id: '12345', title: 'Subsubtitle one', nodes: []}]}, { _id: '12345', title: 'Subsubtitle one', nodes: []}];

    expect(tree.breadcrumbs('12345')).toEqual(breadcrumbs);
  });

  it('should build the correct path to a node', function() {
    var tree = new SequoiaTree(nodes,template),
        path = 'Title three > Subtitle two > Subsubtitle one',
        found = tree.findSelected(['12345']);

    expect(found.length).toBe(1);
    expect(found[0].title).toBe(path);
  });

  it('should fail to retrieve the path to a node', function() {
    var tree = new SequoiaTree(nodes,template),
        found = tree.findSelected('12345');

    expect(found.length).toBe(0);
    expect(log.warn.logs).toContain(['You must pass an array of IDs in order to find the selected nodes!']);
  });

});
