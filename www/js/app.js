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

    .run(function($ionicPlatform) {
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
        });
    })

    .config(function(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('trumpApp');
    })


    .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
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

        // Each tab has its own nav history stack:
            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })
        // The timepoint overview is a child of the dashboard tab, but
        // it loads into the same UI element (ion-nav-view) as the
        // dash itself, supplanting it.
            .state('tab.timepoint-detail', {
                url: '/timepoint/:timepointId',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/timepoint-detail.html',
                        controller: 'TimepointDetailCtrl'
                    }
                }
            })

            .state('tab.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })

            .state('qids-response', {
                url: '/response',
                templateUrl: "templates/qids-response.html",
                controller: 'QIDSResponseCtrl'
            });

        // if none of the above states are matched, use this as the fallback
        // $urlRouterProvider.otherwise('/tab/dash');
        $urlRouterProvider.otherwise('/response');
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


    .factory('AuthService', function($http, $q, $rootScope, AuthToken, AUTH_URL) {
        // service for logging in
        return {
            login: function(username, password) {
                var d = $q.defer();
                $http.post(AUTH_URL, {
                    username: username,
                    password: password
                }).success(function(resp) {
                    AuthToken.set(resp.auth_token);
                    $rootScope.$broadcast('Login successful.');
                    d.resolve(resp.user);
                }).error(function(resp) {
                    $rootScope.$broadcast('Login failed');
                    d.reject(resp.error);
                });
                return d.promise;
            }
        };
    })

    .config(function($httpProvider) {
        return $httpProvider.interceptors.push('AuthInterceptor');
    });
