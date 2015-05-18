// Ionic Trump App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'trump' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'trump.services' is found in services.js
// 'trump.controllers' is found in controllers.js
angular.module('trump', ['ionic', 'trump.controllers', 'trump.services', 'LocalStorageModule'])

// this is where you configure the URL of the backend UI server
    .constant('BACKEND_URL', 'http://localhost:3000/api')
    .constant('AUTH_URL', 'http://localhost:3000/api/auth')


    .run(function($ionicPlatform, $rootScope, $injector, $state) {
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
                        $state.go("login");
                    }
                }
            });
        });
    })

    .config(function(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('trumpApp');
    })


    .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('pinlock', {
                url: '/unlock',
                templateUrl: 'templates/pinlock.html',
                controller: 'PinlockCtrl'
            })

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })

        // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

        // Dashboard or overview tab
            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
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
                        templateUrl: 'templates/qids-detail.html',
                        controller: 'QIDSDetailCtrl'
                    }
                }
            })
            .state('tab.qids-list', {
                url: '/qids-list',
                views: {
                    'tab-qids': {
                        templateUrl: 'templates/tab-qids.html',
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
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })

        // create a new entry
            .state('tab.qids-new', {
                url: '/entry',
                views: {
                    'tab-qids': {
                        templateUrl: "templates/qids-new.html",
                        controller: 'QIDSResponseCtrl'
                    }
                }

            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');
    })


    .factory('AuthToken', function(localStorageService) {
        // service for storing the authentication token in local storage
        return {
            set: function(token) {
                return localStorageService.set('auth_token', token);
            },
            get: function() {
                return localStorageService.get('auth_token');
            },
            delete: function() {
                localStorageService.remove('auth_token');
            }
        };
    })

    .factory('AuthInterceptor', function($q, $injector, AUTH_URL) {
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
    })


    .factory('AuthService', function($http, $q, $rootScope, AuthToken, QIDSResponses, AUTH_URL) {
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
    })

    .config(function($httpProvider) {
        return $httpProvider.interceptors.push('AuthInterceptor');
    })


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
