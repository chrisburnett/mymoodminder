angular.module('trump.controllers', [])

    .controller('DashCtrl', function($scope, Timepoints) {
        $scope.timepoints = Timepoints.all();
        $scope.remove = function(timepoint) {
            Timepoints.remove(timepoint);
        }
    })

    .controller('TimepointDetailCtrl', function($scope, $stateParams, Timepoints) {
        $scope.timepoint = Timepoints.get($stateParams.timepointId);
    })

    .controller('SettingsCtrl', function($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
