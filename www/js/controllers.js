angular.module('trump.controllers', ['angularMoment'])

    .controller('DashCtrl', ["$scope", "$state", "AuthService", "Messages", "MessagePreferences", "User", "QIDSResponses", "$ionicLoading", "$ionicPopup", "NewMessageModal", "Background", function($scope, $state, AuthService, Messages, MessagePreferences, User, QIDSResponses, $ionicLoading, $ionicPopup, NewMessageModal, Background) {

        $scope.bg_url = Background.get();
        // bring up loading modal, as long as the new message modal
        // isn't up
        if(!NewMessageModal.shown()) {
            $ionicLoading.show({
                content: 'Loading Data',
                animation: 'fade-in',
                delay: 100
            });
        } else {
            $ionicLoading.hide();
        };

        // try to sync message preferences then get messages from the
        // server, finally take down curtain

		// Check if the qids has been answered in the last week if not we flag notificationPending to true
        QIDSResponses.sync_pending().finally(function() {
            QIDSResponses.all()
                .then(function(responses) {
                    $scope.qids_responses = responses;
					if($scope.qids_responses && $scope.qids_responses.length > 0){
						//alert('$scope.qids_responses:[0] ' + $scope.qids_responses[0].completed_at);
						
						var oneWeekAgo = new Date(Date.now() + -7*24*3600*1000); // now minus 7 days
						//alert('now - 7 days: ' + oneWeekAgo);
	 
						// format of qids_responses[0].completed_at : 2015-10-20T10:14:23.168Z
						var dateStr = $scope.qids_responses[0].completed_at;
						//var dateStr = "2015-10-13T13:43:23.168Z";
						var datetime = dateStr.split("T");
						var date = datetime[0].split("-");
						var year = date[0];
						var month = date[1];
						var day = date[2];
						var time = datetime[1].split(".")[0].split(":");
						var hh = time[0];
						var mm = time[1];
						var ss = time[2];
						var lastResponseDate = new Date(year,month-1,day,hh,mm,ss);
						lastResponseDate.setHours(lastResponseDate.getHours()+1);
						//alert("lastResponseDate :  "  +  lastResponseDate);
						
						if (lastResponseDate.getTime() > oneWeekAgo.getTime()) {
							//alert("The qids has been answered in the last week");
						}
						else{
							$scope.notificationPending = true;
							//alert("The qids has NOT been answered in the last week");
						}
					}
					else{
						// there has not been any responses submitted yet
						$scope.notificationPending = true;
					}
                });
        });
		
        // get the qids deadline
        $scope.qidsReminder = window.localStorage.getItem('qids_reminder');
		//alert('$scope.qidsReminder: ' + $scope.qidsReminder);
        User.get()
            .then(function(response) {
                $scope.nextQidsDate = response.data.next_qids_reminder_time;
				// never happens because after the reminder notif is being sent, in the backend the next_qids_reminder_time is updated automatically to the next qids reminder date
				if(new Date($scope.nextQidsDate) < Date.now()) {
                    // we set this flag to deal with the case where the
                    // app knows the deadline is passed but we haven't got
                    // the notification from the server yet. In this case,
                    // we tell the view to show the user that a message
                    // will be send 'today'
                    $scope.notificationPending = true;
                }
            })
            .then(function() {
                Messages.all().then(function(messages) {
                    $scope.messages = messages;
                });
            })
            .finally(function() {
                $ionicLoading.hide();
            });

        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };
    }])

    .controller('MessagesCtrl', ["$scope", "$state", "MessagePreferences", "$ionicPopup", "AuthService", "Messages", function($scope, $state, MessagePreferences, $ionicPopup, AuthService, Messages) {

        MessagePreferences.sync_pending()
            .then(function() {
                // we won't do this if any of the sync promises fail
                MessagePreferences.clear_cache();
            })
            .then(function() {
                Messages.all().then(function(messages) {
                    $scope.messages = messages;
                });
            });

        // Alert user that preferences are about to change
        $scope.showAlert = function(message) {
            $ionicPopup.alert({
                title: 'Preferences updated',
                template: '<p>You won\'t receive messages about <emph>'+ message.category.toLowerCase() + '</emph> any more.</p><p> You can always change this in the Settings tab.</p>'
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
        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };
    }])

    .controller('QIDSListCtrl', ["$scope", "$state", "QIDSResponses", "AuthService", "Chart", "$ionicLoading", function($scope, $state, QIDSResponses, AuthService, Chart, $ionicLoading) {
		
        // get cached responses (if any) for chart
        $scope.chart = Chart.create(QIDSResponses.cached());

        //$scope.qids_responses = JSON.parse(window.localStorage.getItem('qids_responses'));
        // try to sync pending responses, then load responses to scope
        QIDSResponses.sync_pending().finally(function() {
            QIDSResponses.all()
                .then(function(responses) {
                    $scope.qids_responses = responses;
                    // update chart with server responses
                    $scope.chart = Chart.create(responses);
                });
        });

        // check for notifications/reminders received
        if(window.localStorage.getItem('qids_reminder'))
            $scope.qidsDue = true;

        $scope.delete = function(response) {
            // immediately delete the response from the scope to update view
            //for(var r in $scope.qids_responses) {
            //    if ($scope.qids_responses[r].completed_at == response.completed_at)
            //        $scope.qids_responses.splice(r, 1);
            //}
            // $ionicLoading.show({
            //     content: 'Loading Data',
            //     animation: 'fade-in',
            //     delay: 1000
            // });

            QIDSResponses.delete(response).then(function(responses) {
                $scope.qids_responses.splice($scope.qids_responses.indexOf(response), 1);
                Chart.update($scope.chart, $scope.qids_responses);

                //$ionicLoading.hide();
            }, function(reason) {
                console.log(reason);
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

    .controller('QIDSDetailCtrl', ["$scope", "$state", "$stateParams", "QIDSResponses", "QuestionnaireText", "AuthService", function($scope, $state, $stateParams, QIDSResponses, QuestionnaireText, AuthService) {
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
            QIDSResponses.delete(response).then(function() {
                $state.go ('tab.qids-list');
				window.localStorage.removeItem('qids_responses');
            }, function(reason) {
                console.log(reason);
            });
        };
    }])



    .controller('QIDSResponseCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicPopup", "QIDSResponses", "QuestionnaireText", "AuthService", function($scope, $state, $ionicSlideBoxDelegate, $ionicPopup, QIDSResponses, QuestionnaireText, AuthService) {

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
            if(!response) {
                var emptyPopup = $ionicPopup.alert({
                    title: 'No information',
                    template: '<p>You haven\'t answered any of the questions. Please answer at least one.</p>'
                });
                emptyPopup.then(function() { return; });
            }

            // if any of the questions are empty
            var missing = false;
			
			var q_sleep_answered_counter = 0;
			var q_psychomotor_answered_counter = 0;
			var q_remaining_answered_counter = 0;
			// checking the 14 questions have been answered
            for(var q in QuestionnaireText) {
				if(q == "q1" || q == "q2" || q == "q3" || q == "q4"){
					if(response[q])
						q_sleep_answered_counter+=1;
				}
				if(q == "q15" || q == "q16"){
					if(response[q])
						q_psychomotor_answered_counter+=1;
				}
				if(q == "q5" || q == "q10" || q == "q11" || q == "q12" || q == "q13" || q == "q14"){
					if(response[q])
						q_remaining_answered_counter+=1;
				}
			}
			if(q_sleep_answered_counter != 4 || q_psychomotor_answered_counter != 2 || q_remaining_answered_counter != 6){
				missing = true;
			}
			
            // check both weight question are answered
            if(!response["q6_7"] || !response["q8_9"]){
                missing = true;
			}

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
            };
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


        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
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

    .controller('SettingsCtrl', ["$scope", "AuthService", "$state", function($scope, AuthService, $state) {

        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };

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

    .controller('ChangePasswordCtrl', ["$scope", "$state", "$ionicPopup", "User", function($scope, $state, $ionicPopup, User) {
        $scope.msgs = {};
        $scope.changePassword = function(user) {
            if(user.password_confirm != user.password) {
                $scope.msgs.passwordMismatch = true;
            } else {
                User.update(user).then(function(data) {
                    $ionicPopup.alert({
                        title: 'Password changed',
                        template: '<p>Your password has been updated.</p>'
                    }).then(function() {
                        $state.go('tab.settings');
                    });

                    $scope.success = true;
                }, function(reason) {
                    //failure
                    $scope.msgs.connectionProblem = true;
                });
            };
        };
    }])

    .controller('PrivacyCtrl', ["$scope", "$state", "AuthService", "User", function($scope, $state, AuthService, User) {
        // load user prefs
        User.get().then(function(response) {
            $scope.user = response.data;
        }, function(reason) {
            $scope.connectionProblem = true;
        });

        $scope.save = function(user) {
            User.update(user).then(function(response) {
                $scope.user = response.data;
            });
        };


        // clear token and go to login screen
        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        };


    }])

    .controller('MessagePrefsCtrl', ["$scope", "MessagePreferences", "User", "AuthService", "$state", function($scope, MessagePreferences, User, AuthService, $state) {

        $scope.connectionProblem = false;

        // message and privacy controls view
        MessagePreferences.all().then(function(prefs) {
            $scope.message_preferences = prefs;
        }, function(reason) {
            $scope.connectionProblem = true;
        });

        User.get().then(function(response) {
            $scope.user = response.data;
            console.log(response.data);
        }, function() {
            $scope.connectionProblem = true;
        });

        // called when the user updates their delivery preference
        $scope.updateDeliveryPreference = function(user) {
            User.update(user).then(function(response) {
                //success
                console.log(response);
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
    }])

	// VB fix start
    /*.controller('HelpCtrl', ["$scope", "User", function($scope, User) {
        var gp_contact = window.localStorage.getItem('gp_contact');
        if(!gp_contact || gp_contact == "null") {
            User.get().then(function(response) {
                $scope.gp_contact = response.data.gp_contact_number;
                // NOTE: not the right place to do this... but
                window.localStorage.setItem('gp_contact', $scope.gp_contact);
            }, function(reason) {
                $scope.connectionProblem = true;
            });
        } else {
            $scope.gp_contact = gp_contact;
        };
    }])*/
	.controller('HelpCtrl', ["$scope", "User", function($scope, User) {
        // retrieve from the server all the time (cause the number might have been updated)
		User.get().then(function(response) {
			$scope.gp_contact = response.data.gp_contact_number;
			// NOTE: not the right place to do this... but
			window.localStorage.setItem('gp_contact', $scope.gp_contact);
		}, function(reason) {
			$scope.connectionProblem = true;
		});
    }])
	// VB fix end
	
	.controller('InfosheetCtrl', ["$scope", function($scope) {

	}])

    .controller('ContactsCtrl', ["$scope", "Contacts", function($scope, Contacts) {
        $scope.contacts = Contacts;
    }])

    .controller('QidsHelpCtrl', ["$scope", function($scope) {

    }])
    .controller('ContactUsCtrl', ["$scope", function($scope) {

    }])

    .controller('PrivacyInfoCtrl', ["$scope", function($scope) {

    }]);
