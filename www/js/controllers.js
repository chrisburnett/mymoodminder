angular.module('trump.controllers', ['angularMoment'])

    .controller('DashCtrl', function($scope, $state, AuthService, Messages) {

        Messages.all().then(function(messages) {
            $scope.messages = messages;
        });
        
        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };
    })

    .controller('QIDSListCtrl', function($scope, $state, QIDSResponses, AuthService) {
        // try to sync pending responses, then load responses to scope
        QIDSResponses.sync_pending().finally(function() {
            QIDSResponses.all()
                .then(function(responses) { $scope.qids_responses = responses; });
        });


        $scope.delete = function(response) {
            // immediately delete the response from the scope to update view
            //for(var r in $scope.qids_responses) {
            //    if ($scope.qids_responses[r].completed_at == response.completed_at)
            //        $scope.qids_responses.splice(r, 1);
            //}
            QIDSResponses.delete(response.completed_at).then(function(responses) {
                $scope.qids_responses.splice($scope.qids_responses.indexOf(response), 1);
            });
        };

        $scope.new = function() {
            $state.go('tab.qids-new');
        };

        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };
    })

    .controller('QIDSDetailCtrl', function($scope, $state, $stateParams, QIDSResponses, QuestionnaireText) {
        // here we will want to use the message service and qids
        // service to get a list of events, order them by time and
        // then add that processed list to the scope
        var response = QIDSResponses.get($stateParams.responseId);

        // conveniently deal with the "joined together" questions
        // so we can look up the text service properly
        if(response.q6_7 < 3) {
            response.q6 = response.q6_7;
            response.q7 = null;
        }
        else {
            response.q7 = response.q6_7 - 4;
            response.q6 = null;
        }
        if(response.q8_9 < 3) {
            response.q8 = response.q8_9;
            response.q9 = null;
        }
        else {
            response.q9 = response.q8_9 - 4;
            response.q8 = null;
        }
        response.q6_7 = null;
        response.q8_9 = null;

        $scope.response = response;
        $scope.text = QuestionnaireText;

        $scope.delete = function(response) {
            QIDSResponses.delete(response.completed_at).then(function() {
                $state.go ('tab.qids-list');
            });
        };
    })



    .controller('QIDSResponseCtrl', function($scope, $state, $ionicSlideBoxDelegate, QIDSResponses, QuestionnaireText) {
        $scope.createResponse = function(response) {
            // get the rest service object and create a new resource
            // on the server, then transition back to dashboard state
            QIDSResponses.save(response).then(function() { $state.go('tab.qids-list'); });
        };
        $scope.showFwd = true;
        $scope.text = QuestionnaireText;

        // slide box control functions
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.back = function() {
            $ionicSlideBoxDelegate.previous();
        };
        $scope.slideChanged = function(index) {

            // control states of buttons
            if(index > 0)
                $scope.showBack = true;
            else
                $scope.showBack = false;

            if(index < $ionicSlideBoxDelegate.slidesCount() - 1)
                $scope.showFwd = true;
            else
                $scope.showFwd = false;

        };

        // visibility of mutually exclisive questions TODO -
        // implementing a directive would be a neater way of doing
        // this probably, this is nasty brittle code, but for now (and
        // given that the questionnaire is not going to change) this
        // will do
        $scope.toggleQ6 = function() {
            $scope.showQ6 = !$scope.showQ6;
            if($scope.showQ6) $scope.showQ7 = false;
        };
        $scope.toggleQ7 = function() {
            $scope.showQ7 = !$scope.showQ7;
            if($scope.showQ7) $scope.showQ6 = false;
        };
        $scope.toggleQ8 = function() {
            $scope.showQ8 = !$scope.showQ8;
            if($scope.showQ8) $scope.showQ9 = false;
        };
        $scope.toggleQ9 = function() {
            $scope.showQ9 = !$scope.showQ9;
            if($scope.showQ9) $scope.showQ8 = false;
        };
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
                    conole.log("The four digit code was entered");
                };

            }
        };

        $scope.delete = function() {
            if($scope.passcode.length > 0) {
                $scope.passcode = $scope.passcode.substring(0, $scope.passcode.length - 1);
            }
        };
    });
