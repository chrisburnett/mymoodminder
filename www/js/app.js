// Ionic Trump App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'trump' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'trump.services' is found in services.js
// 'trump.controllers' is found in controllers.js
angular.module('trump', ['ionic', 'trump.controllers', 'trump.services', 'trump.directives', 'templates', 'LocalStorageModule', 'ngCordova'])

// this is where you configure the URL of the backend UI server
    .constant('BACKEND_URL', 'https://murmuring-depths-9520-staging.herokuapp.com/api')
    .constant('AUTH_URL', 'https://murmuring-depths-9520-staging.herokuapp.com/api/auth')
    //.constant('BACKEND_URL', 'http://localhost:3000/api')
    //.constant('AUTH_URL', 'http://localhost:3000/api/auth')
    .constant('ANDROID_SENDER_ID', '937013579687')

    .run(["$ionicPlatform", "$rootScope", "$injector", "$state", "$cordovaPush", "RegistrationService", "ANDROID_SENDER_ID", function($ionicPlatform, $rootScope, $injector, $state, $cordovaPush, RegistrationService, ANDROID_SENDER_ID) {

        // configuration for the android platform
        var androidConfig = {
            "senderID": ANDROID_SENDER_ID
        };

        $ionicPlatform.ready(function() {

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard

            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            // register listener to watch route changes whenever state
            // changes, we check to see if there's an auth token in
            // local storage. If there's not (i.e. user clicked
            // logout) then any state changes should go to login state
            $rootScope.$on( "$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
                var AuthToken = $injector.get('AuthToken');
                if ( AuthToken.get() == null ) {
                    // no logged user, we should be going to #login
                    if ( toState.name != 'login' ) {
                        // not going to #login, we should redirect now
                        event.preventDefault();
                        $state.go("login");
                    }
                }
            });

            $rootScope.$on( "$stateChangeError", function(event, toState, toParams, fromState, fromParams) {
                // this gets triggered if the authentication resolve in the main tab route fails
                event.preventDefault();
                $state.go("login");
            });

            // register cordova push notifications
            $cordovaPush.register(androidConfig).then(function(result) {
                // success
                console.log(result);
            }, function(error) {
                // error
                console.log(error);
            });
            // notification event handler
            $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
                switch(notification.event) {
                case 'registered':
                    // we now have a device ID, we need to store it to
                    // be posted to the backend, which will actually
                    // be pushing the messages and needs to know who
                    // each message should go to
                    if (notification.regid.length > 0) {
                        // store the token for later - we need to
                        // authenticate before we can register our
                        // device with the backend
                        RegistrationService.set(notification.regid);
                    }
                    break;
                case 'message':
                    // this is the notification
                    if(notification.type == 'message')
                        window.localStorage.setItem('new_message', notification);
                    else
                        window.localStorage.setItem('qids_reminder', Date.now());
                    break;
                case 'error':
                    alert('GCM error = ' + notification.msg);
                    break;
                }
            });

        });
    }])

    .config(["localStorageServiceProvider", function(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('trumpApp');
    }])


    .factory('AuthToken', ["localStorageService", function(localStorageService) {
        // service for storing the authentication token in local storage
        return {
            set: function(token) {
                return window.localStorage.setItem('auth_token', token);
            },
            get: function() {
                return window.localStorage.getItem('auth_token');
            },
            delete: function() {
                window.localStorage.removeItem('auth_token');
            }
        };
    }])


    .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

        var authenticated = function(AuthToken, $q) {
            var d = $q.defer();
            if(AuthToken.get())
                d.resolve();
            else
                d.reject();
            return d.promise;
        };
        authenticated.$inject = ["AuthToken", "$q"];
        
        $stateProvider

            .state('pinlock', {
                url: '/unlock',
                templateUrl: 'pinlock.html',
                controller: 'PinlockCtrl'
            })

            .state('login', {
                url: '/login',
                templateUrl: 'login.html',
                controller: 'LoginCtrl'
            })

        // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "tabs.html",
                resolve: {
                    authenticated: authenticated
                }
            })

        // Dashboard or overview tab
            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'tab-dash.html',
                        controller: 'DashCtrl'
                    }
                },
                cache: false
            })
        // view a list of QIDS entries and details about them
            .state('tab.qids-detail', {
                url: '/qids/:responseId',
                views: {
                    'tab-qids': {
                        templateUrl: 'qids-detail.html',
                        controller: 'QIDSDetailCtrl'
                    }
                }
            })
            .state('tab.qids-list', {
                url: '/qids-list',
                views: {
                    'tab-qids': {
                        templateUrl: 'tab-qids.html',
                        controller: 'QIDSListCtrl'
                    }
                },
                cache: false
            })

        // customise app settings
            .state('tab.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'tab-settings.html',
                        controller: 'SettingsCtrl'
                    }
                },
                cache: false
            })

            .state('tab.withdraw', {
                url: '/withdraw',
                views: {
                    'tab-settings': {
                        templateUrl: 'withdraw.html',
                        controller: 'WithdrawCtrl'
                    }
                }
            })


            .state('tab.messages', {
                url: '/messages',
                views: {
                    'tab-settings': {
                        templateUrl: 'tab-settings-messages.html',
                        controller: 'MessagePrefsCtrl'
                    }
                }
            })

        // create a new entry
            .state('tab.qids-new', {
                url: '/entry',
                views: {
                    'tab-qids': {
                        templateUrl: "qids-new.html",
                        controller: 'QIDSResponseCtrl'
                    }
                }

            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');
    }])


    .factory('AuthInterceptor', ["$q", "$injector", "AUTH_URL", function($q, $injector, AUTH_URL) {
        return {
            // This will be called on every outgoing http request
            request: function(config) {
                var AuthToken = $injector.get('AuthToken');
                var token = AuthToken.get();
                config.headers = config.headers || {};
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config || $q.when(config);
            },
            // This will be called on every incoming response that has en error status code
            responseError: function(response) {
                var matchesAuthenticatePath = response.config && response.config.url.match(AUTH_URL);
                if (!matchesAuthenticatePath) {
                    $injector.get('$rootScope').$broadcast({
                        401: "Not authenticated",
                        403: "Not authorised",
                        419: "Session timed out"
                    }[response.status], response);
                }
                return $q.reject(response);
            }
        };
    }])


    .factory('AuthService', ["$http", "$q", "$rootScope", "AuthToken", "QIDSResponses", "AUTH_URL", function($http, $q, $rootScope, AuthToken, QIDSResponses, AUTH_URL) {
        // service for logging in
        return {
            login: function(username, password) {
                var d = $q.defer();
                $http.post(AUTH_URL, {
                    username: username,
                    password: password
                }).success(function(response) {
                    AuthToken.set(response.auth_token);
                    d.resolve(response.user);
                }).error(function(data, status) {
                    d.reject(status);
                });
                return d.promise;
            },
            logout: function() {
                AuthToken.delete();
                QIDSResponses.clear_cache();
            }
        };
    }])

    .factory('WithdrawService', ["$http", "BACKEND_URL", "AuthToken", function($http, BACKEND_URL, AuthToken) {
        return {
            withdraw: function() {
                // send withdraw message to backend - all
                // confirmations have been done in UI, just do it
                // return a promise. Controller will resolve and update view
                return $http.get(BACKEND_URL + 'user/withdraw');
            }
        };
    }])

    .factory('RegistrationService', ["$q", "$http", "AuthToken", "BACKEND_URL", "localStorageService", function($q, $http, AuthToken, BACKEND_URL, localStorageService) {
        // service for managing the registration id
        return {
            set: function(registration_id) {
                return window.localStorage.setItem('registration_id', registration_id);
            },
            get: function() {
                return window.localStorage.getItem('registration_id');
            },
            delete: function() {
                window.localStorage.removeItem('registration_id');
            },
            register: function() {
                var regid = this.get();
                var d = $q.defer();
                if(regid) {
                    $http.post(BACKEND_URL + '/register', { registration_id: regid }).
                        success(function(data) {
                            // successfully updated registration ID
                            console.log("success!");
                            d.resolve();
                        }).error(function(reason) {
                            // failed to update registration ID
                            console.log(reason);
                            d.reject();
                        });
                } else {
                    d.reject('Cannot register with backend: no device ID');
                }
                return d.promise;
            }
        };
    }])

    .config(["$httpProvider", function($httpProvider) {
        return $httpProvider.interceptors.push('AuthInterceptor');
    }])


    .filter('qidsScore', function() {
        // this service computes the QIDS-SR16 score WARNING: result
        // will be NaN if there are blanks in the response, that is,
        // if the participant didn't answer all the questions. This is
        // because the QIDS scoring scheme isn't defined for cases
        // where answers were skipped, and we'd need to make some kind
        // of assumption then to come up with a score. For now, we'll
        // just pass back a '!' and allow the view to render it
        // somehow
        return function(response) {
            var score = 0;
            var sleepItems = ['q1', 'q2', 'q3', 'q4'];
            var weightItems = ['q6', 'q7', 'q8', 'q9'];
            var remainingItems = ['q5', 'q10', 'q11', 'q12', 'q13', 'q14'];
            var sleepScore = 0;
            var weightScore = 0;
            // pick the highest of the sleep items
            for (var item in sleepItems) {
                var thisScore = parseInt(response[sleepItems[item]]);
                if(thisScore > sleepScore)
                    sleepScore = thisScore;
            }
            // and highest of the weight items
            for (var item in weightItems) {
                var thisScore = parseInt(response[weightItems[item]]);
                if(thisScore > weightScore)
                    weightScore = thisScore;
            }
            score += sleepScore;
            score += weightScore;
            // highest of the two psychomotor scores
            var q15 = parseInt(response.q15);
            var q16 = parseInt(response.q16);
            if(q15 > q16) score += q15;
            else score += q16;
            // add up the rest
            for (var item in remainingItems) {
                score += parseInt(response[remainingItems[item]]);
            }
            return score;
        };
    });
