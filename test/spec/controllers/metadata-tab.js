'use strict';

describe('Controller: MetadataTabCtrl', function () {

  // load the controller's module
  beforeEach(module('ortolangMarketApp'));

  var MetadataTabCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MetadataTabCtrl = $controller('MetadataTabCtrl', {
      $scope: scope
    });
  }));

  
});
