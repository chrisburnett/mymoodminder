angular.module('trump.directives', [])
    .directive('hideTabs', function($rootScope, $state) {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$watch(attributes.hideTabs, function(value) {
                    $rootScope.hideTabs = value;
                });

                scope.$on('$destroy', function() {
                    $rootScope.hideTabs = false;
                    $state.go($state.current, {}, {reload: true});
                });
            }
        };
    });
