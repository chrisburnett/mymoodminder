angular.module('trump.controllers', [])

    .controller('DashCtrl', function($scope, $state, QIDSResponses, AuthService) {
        
        // try to sync pending responses, then load responses to scope
        QIDSResponses.sync_pending().finally(function() {
            QIDSResponses.all()
                .then(function(responses) { $scope.qids_responses = responses; });
        });

        
        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };
    })


    .controller('QIDSResponseDetailCtrl', function($scope, $stateParams, QIDSResponses, QuestionnaireText) {
        // here we will want to use the message service and qids
        // service to get a list of events, order them by time and
        // then add that processed list to the scope
        var response = QIDSResponses.get($stateParams.responseId);

        // conveniently deal with the "joined together" questions
        // so we can look up the text service properly
        if(response.q6_7 < 3)
            response.q6 = response.q6_7;
        else
            response.q7 = response.q6_7 - 4;
        
        if(response.q8_9 < 3)
            response.q8 = response.q8_9;
        else
            response.q9 = response.q8_9 - 4;

        $scope.response = response;
        $scope.text = QuestionnaireText;
    })



    .controller('QIDSResponseCtrl', function($scope, $state, QIDSResponses, QuestionnaireText) {
        $scope.createResponse = function(response) {
            // get the rest service object and create a new resource
            // on the server, then transition back to dashboard state
            QIDSResponses.save(response).then(function() { $state.go('tab.dash'); });
         
        };

        $scope.text = QuestionnaireText;
    })


    .controller('LoginCtrl', function($scope, $state, AuthService) {
        // controller for handling login requests
        $scope.credentials = {};
  
        
        $scope.login = function(credentials) {
            // reset problem flags
            $scope.wrongCredentials = null;
            $scope.cannotConnect = null;
            AuthService.login(credentials.username, credentials.password).then(
                function() {
                    $state.go('tab.dash');
                }, function(reason) {
                    // display the appropriate error message
                    if(reason == "401") { $scope.wrongCredentials = true; }
                    else { $scope.cannotConnect = true; }
                });
        };
    })

    .controller('SettingsCtrl', function($scope) {

    })

    .controller('PinlockCtrl', function($scope) {
        $scope.init = function() {
            $scope.passcode = "";
        };
        
        $scope.add = function(value) {
            if($scope.passcode.length < 4) {
                $scope.passcode = $scope.passcode + value;
                if($scope.passcode.length == 4) {
                    console.log("The four digit code was entered");
                };
                
            }
        };
        
        $scope.delete = function() {
            if($scope.passcode.length > 0) {
                $scope.passcode = $scope.passcode.substring(0, $scope.passcode.length - 1);
            }
        };
    });
