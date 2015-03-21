angular.module('trump.services', ['LocalStorageModule', 'ngResource'])

    .factory('QIDSResponses', function(localStorageService, BACKEND_URL, $resource) {
        return {
            // return a service which lets us persist a response
            // between invocations of the app locally (for now) and
            // retrieve it later
            save: function(response) {
                var qids_responses = localStorageService.get('qids_responses');
                if(!qids_responses) qids_responses = {};
                // use the date and time of completion as the key
                // locally, but also set it as a property so it gets
                // uploaded at sync
                var completion_time = (new Date()).toISOString();;
                response.completion_time = completion_time;
                qids_responses[completion_time] = response;
                localStorageService.set('qids_responses', qids_responses);
            },
            all: function() {
                return localStorageService.get('qids_responses');
            },
            rest: function() {
                // configure a rest service proxy and return it
                return $resource(BACKEND_URL);
            }
        };
    })

    .factory('AuthToken', function(localStorageService) {
        // service for storing the authentication token in local storage
        return {
            set: function(token) {
                return localStorageService.set('auth_token', token);
            },
            get: function() {
                return localStorageService.get('auth_token');
            }
        };
    })

    .factory('AuthService', function($http, $q, $rootScope, AuthToken, AuthEvents, AUTH_URL) {
        // service for logging in
        return {
            login: function(username, password) {
                var d = $q.defer();
                $http.post(AUTH_URL, {
                    username: username,
                    password: password
                }).success(function(resp) {
                    AuthToken.set(resp.auth_token);
                    $rootScope.$broadcast(AuthEvents.loginSuccess);
                    d.resolve(resp.user);
                }).error(function(resp) {
                    $rootScope.$broadcast(AuthEvents.loginFailed);
                    d.reject(resp.error);
                });
                return d.promise;
            }
        };
    })

    .factory('Timepoints', function() {
        // Might use a resource here that returns a JSON array We
        // should be querying the intermediate data service after
        // checking the local data store

        // Some fake testing data
        var timepoints = [{
            id: 0,
            type: "message",
            date: "2015-03-13T18:25:43.511Z"
        }, {
            id: 1,
            type: "message",
            date: "2015-03-14T18:25:43.511Z"
        }, {
            id: 2,
            type: "qids_response",
            date: "2015-03-15T18:25:43.511Z"
        }, {
            id: 3,
            type: "qids_response",
            date: "2015-03-15T18:25:43.511Z"
        }];

        // just look at this sneaky javascript - return an anonymous
        // object with the following methods
        return {
            all: function() {
                return timepoints;
            },
            remove: function(timepoint) {
                timepoints.splice(timepoints.indexOf(timepoint), 1);
            },
            get: function(timepointId) {
                for (var i = 0; i < timepoints.length; i++) {
                    if (timepoints[i].id === parseInt(timepointId)) {
                        return timepoints[i];
                    }
                }
                return null;
            }
        };
    });
