angular.module('trump.controllers', [])

    .controller('DashCtrl', function($scope, Timepoints, QIDSResponses) {
        $scope.timepoints = Timepoints.all();
        $scope.remove = function(timepoint) {
            Timepoints.remove(timepoint);
        };
        $scope.qids_responses = QIDSResponses.all();
    })

    .controller('TimepointDetailCtrl', function($scope, $stateParams, Timepoints) {
        $scope.timepoint = Timepoints.get($stateParams.timepointId);
    })

    .controller('QIDSResponseCtrl', function($scope, QIDSResponses) {
        $scope.createResponse = function(response) {
            console.log(QIDSResponses.save(response));
        };
    })

    .controller('SettingsCtrl', function($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
