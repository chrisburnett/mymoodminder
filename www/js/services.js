angular.module('trump.services', ['LocalStorageModule', 'ngResource'])

    .factory('QIDSResponses', ["localStorageService", "BACKEND_URL", "$q", "$resource", "qidsScoreFilter", function(localStorageService, BACKEND_URL, $q, $resource, qidsScoreFilter) {
        return {
            // return a service which lets us persist a response
            // between invocations of the app locally (for now) and
            // retrieve it later
            cached: function() {
                if(window.localStorage.getItem('qids_responses'))
                    return JSON.parse(window.localStorage.getItem('qids_responses'));
                else
                    return [];
            },
            all: function() {
                var d = $q.defer();
                $resource(BACKEND_URL + '/qids_responses')
                    .query({}, function(data) {
                        // if successful, update local storage
                        window.localStorage.setItem('qids_responses', JSON.stringify(data));
                        d.resolve(data);
                    }, function(reason) {
                        // if can't connect, just return local storage
                        // miss out responses that are pending to be deleted
                        var qids_responses = JSON.parse(window.localStorage.getItem('qids_responses'));
                        if(qids_responses)
                            d.resolve(qids_responses.filter(function(response) {
                                return !response.delete;
                            }));
                    });
                return d.promise;
            },
            get: function(completed_at) {
                var qids_responses = JSON.parse(window.localStorage.getItem('qids_responses'));
                for(var response in qids_responses)
                    if(qids_responses[response].completed_at == completed_at) return qids_responses[response];
                // it shouldn't happen that we can't find the matching
                // response. If this happens, let the controller deal
                // with it
                return null;
            },
            save: function(response) {
                // the list of responses is stored locally in localStorage.
                // update this before sending to server
                var qids_responses = JSON.parse(window.localStorage.getItem('qids_responses') || []);
                var d = $q.defer();

                // use the date and time of completion as the key
                // locally, but also set it as a property so it gets
                // uploaded at sync
                response = response || {};
                var completed_at = response.completed_at;
                if(!completed_at) {
                    completed_at = (new Date()).toISOString();
                    response.completed_at = completed_at;
                }

                // compute the score locally and append it
                response.score = qidsScoreFilter(response);

                // if we are using the remote storage scheme, send to
                // server (for now, just do this anyway) if we are
                // unable to connect, mark the QIDSresponse as pending
                // for later submission
                $resource(BACKEND_URL + '/qids_responses').save(response).$promise.then(function(data) {
                    response.pending = false;
                    d.resolve(data);
                }, function(reason) {
                    // don't re-save a pending response
                    if(!response.pending) {
                        response.pending = true;
                        // store in localstorage
                        qids_responses.push(response);
                        window.localStorage.setItem('qids_responses', JSON.stringify(qids_responses));
                    }
                    d.resolve(reason);
                });
                return d.promise;
            },
            delete: function(completed_at) {
                // we use the completion time to identify the
                // QIDSresponse on the client, becuase it might not
                // have been created on the server yet
                // try to delete. Next time use a sync library for this...
                var d = $q.defer();
                var qids_responses = JSON.parse(window.localStorage.getItem('qids_responses'));
                for (var response in qids_responses) {
                    if (qids_responses[response].completed_at == completed_at) {
                        // if the matching response doesn't have an id
                        // attribute yet, it hasn't been persisted on
                        // the backend - just delete and be done with
                        if(!qids_responses[response].id) {
                            qids_responses.splice(qids_responses.indexOf(response), 1);
                            window.localStorage.setItem('qids_responses', JSON.stringify(qids_responses));
                            d.resolve(qids_responses);
                        } else {
                            var id = qids_responses[response].id;
                            $resource(BACKEND_URL + '/qids_responses/:id').delete({id: id}).$promise.then(function() {
                                // successfully deleted
                                // clear from hash only if we were able to
                                // delete on server, otherwise leave it with
                                // the delete flag set. We'll ignore it and
                                // try to delete later
                                qids_responses.splice(qids_responses.indexOf(response), 1);
                                //window.localStorage.setItem('qids_responses', qids_responses);
                                d.resolve(qids_responses);
                            }, function() {
                                // the response has been persisted but
                                // we can't update the server yet -
                                // mark for deletion
                                qids_responses[response].delete = true;
                                // on failure, update localstorage with response marked for deletion
                                // it will be hidden
                                d.resolve(qids_responses);
                            }).finally(function() {
                                // finally update localstorage
                                var new_qids_responses = JSON.parse(window.localstorage.getItem('qids_responses'));
                                new_qids_responses.splice(qids_responses.indexOf(response), 1);
                                window.localStorage.setItem('qids_responses', JSON.stringify(new_qids_responses));
                            });
                        }
                        break;
                    };
                };
                return d.promise;
            },
            clear_cache: function() {
                window.localStorage.removeItem('qids_responses');
            },
            sync_pending: function() {
                // collect up all the promises so that we can resolve them as one
                var promises = [];
                // for each pending response in localstorage, try to save.
                var qids_responses = JSON.parse(window.localStorage.getItem('qids_responses'));
                if(qids_responses) {
                    for(var i = 0; i < qids_responses.length; i++) {
                        if(qids_responses[i].pending) promises.push(this.save(qids_responses[i]));
                        if(qids_responses[i].delete) promises.push(this.delete(qids_responses[i].completed_at));
                    }
                }
                return $q.all(promises);
            }
        };
    }])

    .factory('QuestionnaireText', function() {
        return {
            q1: {
                q: "Falling asleep",
                0: "I never take longer than 30 minutes to fall asleep.",
                1: "I take at least 30 minutes to fall asleep, less than half the time.",
                2: "I take at least 30 minutes to fall asleep, more than half the time.",
                3: "I take more than 60 minutes to fall asleep, more than half the time."
            },
            q2: {
                q: "Sleeping at night",
                0: "I do not wake up at night.",
                1: "I have a restless, light sleep with a few brief awakenings each night.",
                2: "I wake up at least once a night, but I go back to sleep easily.",
                3: "I awaken more than once a night and stay awake for 20 minutes or more, more than half the time."
            },
            q3: {
                q: "Waking up too early",
                0: "Most of the time, I awaken no more than 30 minutes before I need to get up.",
                1: "More than half the time, I awaken more than 30 minutes before I need to get up.",
                2: "I almost always awaken at least one hour or so before I need to, but I go back to sleep eventually.",
                3: "I awaken at least one hour before I need to, and can't go back to sleep."
            },
            q4: {
                q: "Sleeping too much",
                0: "I sleep no longer than 7-8 hours/night, without napping during the day.",
                1: "I sleep no longer than 10 hours in a 24-hour period including naps.",
                2: "I sleep no longer than 12 hours in a 24-hour period including naps.",
                3: "I sleep longer than 12 hours in a 24-hour period including naps."
            },
            q5: {
                q: "Feeling sad",
                0: "I do not feel sad.",
                1: "I feel sad less than half the time.",
                2: "I feel sad more than half the time.",
                3: "I feel sad nearly all the time."
            },
            q6: {
                q: "Decreased appetite",
                0: "There is no change in my usual appetite.",
                1: "I eat somewhat less often or lesser amounts of food than usual.",
                2: "I eat much less than usual and only with personal effort.",
                3: "I rarely eat within a 24-hour period, and only with extreme personal effort or when others persuade me to eat."
            },
            q7: {
                q: "Increased appetite ",
                0: "There is no change from my usual appetite.",
                1: "I feel a need to eat more frequently than usual.",
                2: "I regularly eat more often and/or greater amounts of food than usual.",
                3: "I feel driven to overeat both at mealtime and between meals."
            },
            q8: {
                q: "Decreased weight (within the last two weeks)",
                0: "I have not had a change in my weight.",
                1: "I feel as if I have had a slight weight loss.",
                2: "I have lost 2 pounds or more.",
                3: "I have lost 5 pounds or more."
            },
            q9: {
                q: "Increased weight (within the last two weeks)",
                0: "I have not had a change in my weight.",
                1: "I feel as if I have had a slight weight gain.",
                2: "I have gained 2 pounds or more.",
                3: "I have gained 5 pounds or more."
            },
            q10: {
                q: "Concentration and decision making",
                0: "There is no change in my usual capacity to concentrate or make decisions.",
                1: "I occasionally feel indecisive or find that my attention wanders.",
                2: "Most of the time, I struggle to focus my attention or to make decisions.",
                3: "I cannot concentrate well enough to read or cannot even make minor decisions."
            },
            q11: {
                q: "View of myself",
                0: "I see myself as equally worthwhile and deserving as other people.",
                1: "I am more self-blaming than usual.",
                2: "I largely believe that I cause problems for others.",
                3: "I think almost constantly about major and minor defects in myself."
            },
            q12: {
                q: "Thoughts of death or suicide",
                0: "I do not think of suicide or death.",
                1: "I feel that life is empty or wonder if it's worth living.",
                2: "I think of suicide or death several times a week for several minutes.",
                3: "I think of suicide or death several times a day in some detail, or I have made specific plans for suicide, or have actually tried to take my life."
            },
            q13: {
                q: "General interest",
                0: "There is no change from usual in how interested I am in other people or activities.",
                1: "I notice that I am less interested in people or activities.",
                2: "I find I have interest in only one or two of my formerly pursued activities.",
                3: "I have virtually no interest in formerly pursued activities."
            },
            q14: {
                q: "Energy level",
                0: "There is no change in my usual level of energy.",
                1: "I get tired more easily than usual.",
                2: "I have to make a big effort to start or finish my usual daily activities (for example, shopping, homework, cooking, or going to work).",
                3: "I really cannot carry out most of my usual daily activities because I just don't have the energy."
            },
            q15: {
                q: "Feeling slowed down",
                0: "I think, speak, and move at my usual rate of speed.",
                1: "I find that my thinking is slowed down or my voice sounds dull or flat.",
                2: "It takes me several seconds to respond to most questions and I'm sure my thinking is slowed.",
                3: "I am often unable to respond to questions without extreme effort."
            },
            q16: {
                q: "Feeling restless",
                0: "I do not feel restless.",
                1: "I'm often fidgety, wringing my hands, or need to shift how I am sitting.",
                2: "I have impulses to move about and am quite restless.",
                3: "At times, I am unable to stay seated and need to pace around."
            }
        };
    })


    .factory('MessagePreferences', ["$q", "BACKEND_URL", "$http", "$resource", function($q, BACKEND_URL, $http, $resource) {
        // this service handles message preferences
        return {

            all: function() {
                var d = $q.defer();
                $resource(BACKEND_URL + '/message_preferences')
                    .query({}, function(data) {
                        d.resolve(data);
                    }, function(reason) {
                        d.reject(reason);
                    });
                return d.promise;
            },

            save: function(preference) {
                // create a message preference on the server state is
                // state: a boolean specifying whether to receive this
                // message category or not
                var d = $q.defer();
                $resource(BACKEND_URL + '/message_preferences')
                    .save(preference).$promise
                    .then(function() {
                        d.resolve();
                    }, function(reason) {
                        // failure to connect - need to store in
                        // localstorage - sync will pick it up later
                        var message_prefs = JSON.parse(window.localStorage.getItem('message_preferences')) || [];
                        message_prefs.push(preference);
                        window.localStorage.setItem('message_preferences', JSON.stringify(message_prefs));
                        d.reject();
                    });
                return d.promise;
            },

            bulk_save: function(preferences) {
                // upload a JSON array of new preference states
                return $http.post(BACKEND_URL + '/message_preferences/mass_update',
                                  preferences);
            },

            sync_pending: function() {
                // if there are locally stored preferences, try to save them and clear
                var promises = [];
                var message_prefs = JSON.parse(window.localStorage.getItem('message_preferences'));
                if(message_prefs)
                    for(var i = 0; i < message_prefs.length; i++) {
                        message_prefs.splice(message_prefs[i], 1);
                        promises.push(this.save(message_prefs[i]));
                    }
                return $q.all(promises);
            },
            clear_cache: function() {
                // after sync, remove locally stored preferences
                window.localStorage.removeItem('message_preferences');
            }
        };
    }])

    .factory('User', ["$http", "BACKEND_URL", function($http, BACKEND_URL) {
        // service for setting stuff on the user profile
        return {
            get: function() {
                return $http.get(BACKEND_URL + '/user');
            },
            updateDeliveryPreference: function(user) {
                return $http.put(BACKEND_URL + '/user', user);
            }
        };
    }])

    .factory('Messages', ["$q", "BACKEND_URL", "$resource", function($q, BACKEND_URL, $resource) {
        // just look at this sneaky javascript - return an anonymous
        // object with the following methods
        return {
            cached: function() {
                return JSON.parse(window.localStorage.getItem('messages'));
            },
            create: function(text) {
                // create a personal log message
                var d = $q.defer();
                $resource(BACKEND_URL + '/messages')
                    .save({
                        content: text,
                        log_entry: true
                    })
                    .then(function(data) {
                        // success
                        d.resolve();
                    }, function(reason) {
                        // can't contact server
                        console.log(reason);
                        d.reject();
                    });
                return d;
            },
            all: function() {
                var d = $q.defer();
                $resource(BACKEND_URL + '/messages')
                    .query({}, function(data) {
                        window.localStorage.setItem('messages', JSON.stringify(data));
                        d.resolve(data);
                    }, function(reason) {
                        console.log('ERROR');
                        var messages = JSON.parse(window.localStorage.getItem('messages'));
                        d.resolve(messages);
                    });
                return d.promise;
            },
            delete: function(message) {
                var d = $q.defer();
                var messages = JSON.parse(window.localStorage.getItem('messages'));
                for(var m in messages) {
                    if(message.id === messages[m].id) {
                        messages.splice(m, 1);
                        window.localStorage.setItem('messages', JSON.stringify(messages));
                        d.resolve(messages);
                        break;
                    }
                }
                return d.promise;
            }

        };
    }])

    .factory('Background', ["BG_COUNT", function(BG_COUNT) {
        // this service returns a random background from the resource
        // directory for the message display modal (or other uses)
        return {
            get: function() {
                var index = Math.floor(Math.random() * (BG_COUNT)) + 1;
                return 'img/bg' + index + '.jpg';
            }
        };
    }])

    .factory('NewMessageModal', ["$rootScope", "$ionicModal", "Background", function($rootScope, $ionicModal, Background){
        // new message modal - if we have just received a new message,
        // bring up a nice screen to show it to the user
        var messageModal;
        $ionicModal.fromTemplateUrl('message-modal.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            messageModal = modal;
        });

        return {
            open: function(new_message) {

                // it's initialised now -n if there's a message, open the
                // modal
                if(!messageModal.isShown()) {
                    $rootScope.messageModal = messageModal;
                    $rootScope.closeModal = function() {
                        $rootScope.messageModal.hide();
                        // we don't presently remove the modal
                        //$rootScope.messageModal.remove();
                    };
                };
                $rootScope.new_message = new_message;
                $rootScope.bg_url = Background.get();
                $rootScope.messageModal.show();
            },
            shown: function() {
                return messageModal.isShown();
            }
        };
    }])

    .factory('Chart', ["moment", function(moment) {
        // service to create the chart js structure, keeps it out of
        // the controller
        var options = {
            high: 27,
            referenceValue: 27,
            low: 0,
            onlyInteger: true,
            scaleMinSpace: 20,
            chartPadding: {
                top: 10,
                right: 5,
                bottom: -10,
                left: -15
            },
            lineSmooth: Chartist.Interpolation.simple({
                divisor: 2
            }),
            showArea: true
        };
        
        var update = function(responses) {
            var chart = {};
            var labels = [], data = [];
            responses.forEach(function(q) {
                labels.push(
                    moment(q.completed_at).format("MMM D")
                );
                data.push(parseInt(q.score));
            });
            // reverse because the items come out in reverse chronilogical order
            chart.labels = labels.reverse();
            chart.series = [data.reverse()];
            return chart;
        };
        
        return {
            create: function(responses) {
                var chartObj = update(responses);
                return new Chartist.Line('.ct-chart', chartObj, options);
            },
            update: function(chart, responses) {
                var chartObj = update(responses);
                chart.update(chartObj);
            }
        };
    }])

    .factory('Categories', ["$q", "BACKEND_URL", "$resource", function($q, BACKEND_URL, $resource) {
        return {
            all: function() {
                var d = $q.defer();
                $resource(BACKEND_URL + '/categories')
                    .query({}, function(data) {
                        d.resolve(data);
                    }, function(reason) {
                        d.resolve(reason);
                    });
                return d.promise;
            }
        };
    }]);
