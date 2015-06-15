angular.module('i18n', [])
    .service('i18n', ['$q', function ($q) {
        var self = this;
        this.resolve = function(ctx) {
            var deferred = $q.defer();
            self.resolveSpy = ctx;
            deferred.resolve(self.resolveResponse || ctx.default);
            return deferred.promise;
        };

        this.translate = function(ctx) {
            var deferred = $q.defer();
            self.translateSpy = ctx;
            deferred.resolve('id');
            return deferred.promise;
        };
    }]);