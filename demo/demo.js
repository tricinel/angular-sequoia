'use strict';

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
          _id: '12341234123414531234',
          title: 'Subtitle one',
          nodes: [
            {
              _id: '4634575647',
              title: 'Subsubtitle one',
              nodes: [
                {
                  _id: '123123123123',
                  title: 'Subsubsubtitle one'
                }
              ]
            }
          ]
        },
        {
          _id: '16789',
          title: 'Subtitle two'
        }
      ]
    },
    {
      _id: '2134123412341234',
      title: 'Title two',
      nodes: [
        {
          _id: '00678234559',
          title: 'Subtitle one'
        },
        {
          _id: '34632463574',
          title: 'Subtitle two'
        }
      ]
    },
    {
      _id: '46783721376',
      title: 'Curriculum Items',
      nodes: [
        {
          _id: '0578234547635',
          title: 'RCPCH Paediatric Immunology, Infectious Diseases and Allergy',
          nodes: [
            {
              _id: '3450963402-5892345',
              title: 'Detailed knowledge of common and serious paediatric conditions and their management in General Paediatrics or in a paediatric sub-specialty',
              nodes: [
                  {
                  _id: '23459817234012734',
                  title: 'Emphasis on Immunology and infectious diseases',
                  nodes: [
                    {
                      _id: '12093481023984',
                      title: 'Know and understand the complexities of the relationship between the host and infecting organisms'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  vm.treeOptions = {
    canEdit: true,
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

var app = angular.module('sequioaDemo', ['ngSequoia']);

app.controller('MainController', MainController);