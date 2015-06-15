angular.module('config.rest', [])
    .factory('publicConfigReader', function () {
        return jasmine.createSpy('configReader');
    })
    .factory('publicConfigWriter', function () {
        return jasmine.createSpy('configWriter');
    });