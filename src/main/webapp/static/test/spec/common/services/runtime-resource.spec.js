'use strict';

describe('Service: RuntimeResource', function () {

    // load the service's module
    beforeEach(module('ortolangMarketApp'));

    // instantiate service
    var RuntimeResource;
    beforeEach(inject(function (_RuntimeResource_) {
        RuntimeResource = _RuntimeResource_;
    }));

    it('should do something', function () {
        expect(!!RuntimeResource).toBe(true);
    });

});
