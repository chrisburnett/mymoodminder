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

    .controller('LoginCtrl', function($scope, $state, AuthService) {
        // controller for handling login requests
        $scope.credentials = {};
        $scope.login = function(credentials) {

            AuthService.login(credentials.username, credentials.password).then(function() {
                $state.go('qids-response');
            });
        };
    })

    .controller('SettingsCtrl', function($scope) {
        $scope.settings = {
            enableFriends: true
        };
    })

    .controller('PinlockCtrl', function($scope) {
        $scope.init = function() {
            $scope.passcode = "";
        }
        
        $scope.add = function(value) {
            if($scope.passcode.length < 4) {
                $scope.passcode = $scope.passcode + value;
                if($scope.passcode.length == 4) {
                    console.log("The four digit code was entered");
                };
                
            }
        }
        
        $scope.delete = function() {
            if($scope.passcode.length > 0) {
                $scope.passcode = $scope.passcode.substring(0, $scope.passcode.length - 1);
            }
        }
    });
