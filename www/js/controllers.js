angular.module('trump.controllers', ['angularMoment'])

    .controller('DashCtrl', ["$scope", "$state", "AuthService", "Messages", "MessagePreferences", "$ionicLoading", "$ionicPopup", "$ionicModal", function($scope, $state, AuthService, Messages, MessagePreferences, $ionicLoading, $ionicPopup, $ionicModal) {

        // check for notifications/reminders received
        if(window.localStorage.getItem('qids_reminder'))
            $scope.qidsReminder = true;
        var new_message = window.localStorage.getItem('new_message');
        if(new_message)
            $scope.new_message = new_message;

        // bring up loading modal
        $ionicLoading.show({
            content: 'Loading Data',
            animation: 'fade-in',
            delay: 1000
        });
        // try to sync message preferences then get messages from the
        // server, finally take down curtain
        MessagePreferences.sync_pending()
            .then(function() {
                // we won't do this if any of the sync promises fail
                MessagePreferences.clear_cache();
                $ionicLoading.hide();
            }, function() {
                $ionicLoading.hide();
            })
            .finally(function() {
                Messages.all().then(function(messages) {
                    $scope.messages = messages;
                });
            });

        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };
        // new message modal - if we have just received a new message,
        // bring up a nice screen to show it to the user
        $ionicModal.fromTemplateUrl('message-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            // it's initialised now - if there's a message, open the
            // modal
            var new_message = window.localStorage.getItem('new_message');
            if(new_message) {
                $scope.new_message = JSON.parse(new_message);
                $scope.modal.show();
            };
        });
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });


        // An alert dialog. After alerting, delete the message
        $scope.showAlert = function(message) {
            $ionicPopup.alert({
                title: 'Preferences updated',
                template: '<p>You won\'t receive messages about <emph>being '+ message.category + '</emph> any more.</p><p> You can always change this in the Settings tab.</p>'
            }).then(function() {
                // delete the message from local scope, then create a
                // message preference on the server for this message's
                // category. After this, we shouldn't get the unwanted
                // message back again
                Messages.delete(message).then(function(messages) {
                    MessagePreferences.save({
                        category_id: message.category_id,
                        state: false
                    });
                    $scope.messages = messages;
                });
                //$scope.messages.splice($scope.messages.indexOf(message));
            });
        };

        $scope.doQidsReminder = function() {
            // clear the reminder key from localstorage and go to new
            // reminder view
            $state.go('tab.qids-new');
        };
    }])

    .controller('QIDSListCtrl', ["$scope", "$state", "QIDSResponses", "AuthService", "$ionicLoading", function($scope, $state, QIDSResponses, AuthService, $ionicLoading) {
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
            $ionicLoading.show({
                content: 'Loading Data',
                animation: 'fade-in',
                delay: 1000
            });

            QIDSResponses.delete(response.completed_at).then(function(responses) {
                $scope.qids_responses.splice($scope.qids_responses.indexOf(response), 1);
                $ionicLoading.hide();
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
    }])

    .controller('QIDSDetailCtrl', ["$scope", "$state", "$stateParams", "QIDSResponses", "QuestionnaireText", function($scope, $state, $stateParams, QIDSResponses, QuestionnaireText) {
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
    }])



    .controller('QIDSResponseCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicPopup", "QIDSResponses", "QuestionnaireText", function($scope, $state, $ionicSlideBoxDelegate, $ionicPopup, QIDSResponses, QuestionnaireText) {

        var save = function(response) {
            // get the rest service object and create a new resource
            // on the server, then transition back to dashboard state
            QIDSResponses.save(response).then(function() {
                // when the user creates a response, clear the reminder
                window.localStorage.removeItem('qids_reminder');
                $state.go('tab.qids-list');
            });
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

        $scope.createResponse = function(response) {
            // if any of the questions are empty
            var missing = false;
            for(var q in QuestionnaireText) {
                if(!response[q]) {
                    // should be a better way to do this...
                    if(q != "q6" && q != "q7" && q != "q8" && q != "q9") {
                        missing = true;
                        break;
                    }
                }
            }
            // check mutual exclusives
            if(response["q6_7"] || response["q7_8"])
                missing = false;

            if(missing) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Missing information',
                    template: '<p>You haven\'t answered all of the questions. That\'s OK, it only means we won\'t be able to give you a score. Do you still want to save?</p>'
                });
                confirmPopup.then(function(answer) {
                    if(answer) {
                        save(response);
                    };
                });
            } else {
                save(response);
            }
        }

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
    }])


    .controller('LoginCtrl', ["$scope", "$state", "AuthService", "RegistrationService", "$ionicLoading", function($scope, $state, AuthService, RegistrationService, $ionicLoading) {
        // controller for handling login requests
        $scope.credentials = {};

        $scope.login = function(credentials) {
            // reset problem flags
            $scope.wrongCredentials = null;
            $scope.cannotConnect = null;
            // bring up loading modal in case logging in takes ages
            $ionicLoading.show({
                content: 'Loading Data',
                animation: 'fade-in',
                delay: 1000
            });
            AuthService.login(credentials.username, credentials.password)
                .then(function() {
                    $ionicLoading.hide();
                    $state.go('tab.dash');
                }, function(reason) {
                    $ionicLoading.hide();

                    // display the appropriate error message
                    if(reason == "401") { $scope.wrongCredentials = true; }
                    else { $scope.cannotConnect = true; }
                })
                .then(function() {
                    // now try to register device with the backend
                    RegistrationService.register();
                }, function(reason) {
                    $scope.registrationFailure = true;
                });

        };
    }])

    .controller('SettingsCtrl', ["$scope", function($scope) {


    }])

    .controller('WithdrawCtrl', ["$scope", "$state", "AuthService", "WithdrawService", "$ionicPopup", function($scope, $state, AuthService, WithdrawService, $ionicPopup) {
        $scope.withdraw = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure?',
                template: '<p>Your MyMoodMinder information will be deleted, and you will no longer be able to log in.<p>'
            });
            confirmPopup.then(function(answer) {
                if(answer) {
                    WithdrawService.withdraw().then(
                        function() {
                            AuthService.logout();
                            $state.go('login');
                        }, function() {
                            $scope.connectionProblem = true;
                        }
                    );
                };
            });
        };
    }])

    .controller('MessagePrefsCtrl', ["$scope", "MessagePreferences", "User", "AuthService", "$state", function($scope, MessagePreferences, User, AuthService, $state) {

        $scope.connectionProblem = false;

        // message and privacy controls view
        MessagePreferences.all().then(function(prefs) {
            $scope.message_preferences = prefs;
        }, function(reason) {
            $scope.connectionProblem = true;
        }).then(function() {
            User.get().then(function(user) {
                $scope.user = user;
            }, function() {
                $scope.connectionProblem = true;
            });
        });

        // called when the user updates their delivery preference
        $scope.updateDeliveryPreference = function(user) {
            User.updateDeliveryPreference(user).then(function(data) {
                //success
                console.log(data);
            }, function(reason) {
                //failure
                console.log(reason);
            });
        };

        $scope.save = function(preference) {
            MessagePreferences.save(preference).catch(function(data) {
                // if there's no communication with server, or a
                // problem, then show the problem display
                $scope.connectionProblem = true;
            });
        };

        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };

    }])

    .controller('PinlockCtrl', ["$scope", function($scope) {
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
    }]);
