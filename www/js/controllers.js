angular.module('trump.controllers', [])

    .controller('DashCtrl', function($scope, Timepoints, QIDSResponses) {
        $scope.timepoints = Timepoints.all();
        $scope.remove = function(timepoint) {
            Timepoints.remove(timepoint);
        };
        $scope.qids_responses = QIDSResponses.all();
    })

    .controller('TimepointDetailCtrl', function($scope, $stateParams, Timepoints) {
        // here we will want to use the message service and qids
        // service to get a list of events, order them by time and
        // then add that processed list to the scope
        $scope.timepoint = Timepoints.get($stateParams.timepointId);
    })

    .controller('QIDSResponseCtrl', function($scope, QIDSResponses) {
        $scope.createResponse = function(response) {
            // get the rest service object and create a new resource
            // on the server
            QIDSResponses.rest().save(response);
        };
    })

    .controller('LoginCtrl', function($scope, AuthService) {
        // controller for handling login requests
        $scope.credentials = {};

        $scope.login = function(credentials) {
            return AuthService.login(credentials.username, credentials.password);
        };
    })

    .controller('SettingsCtrl', function($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
