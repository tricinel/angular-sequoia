* come up with a clever way to show the full path for long node names in search, breadcrumbs, selected
* UI testing (different scenarios)
  1. Tree as editor-only (do not pass an ng-model)
  2. Tree as creator (do not pass an ng-model, pass an empty tree array)
  3. Tree as selector-only (canEdit: false)
  4. Tree as editor + selector (ng-model + canEdit: true)
  5. Tree as just visualiser, no editing or selecting (do not pass an ng-model, canEdit: false)
  6. Use as modal vs use inline
  7. Async tree
* Create examples for all test scenarios