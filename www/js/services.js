angular.module('trump.services', ['LocalStorageModule', 'ngResource'])

    .factory('QIDSResponses', function(localStorageService, BACKEND_URL, $q, $resource) {
        return {
            // return a service which lets us persist a response
            // between invocations of the app locally (for now) and
            // retrieve it later
            all: function() {
                var d = $q.defer();
                $resource(BACKEND_URL + '/qids_responses')
                    .query({}, function(data) {
                        // if successful, update local storage
                        localStorageService.set('qids_responses', data);
                        d.resolve(data);
                    }, function(reason) {
                        // if can't connect, just return local storage
                        d.resolve(localStorageService.get('qids_responses'));
                    });
                return d.promise;

            },
            save: function(response) {
                // the list of responses is stored locally in localStorage.
                var qids_responses = localStorageService.get('qids_responses') || {};

                // use the date and time of completion as the key
                // locally, but also set it as a property so it gets
                // uploaded at sync
                var completed_at = (new Date()).toISOString();
                response.completed_at = completed_at;
                qids_responses[completed_at] = response;
                localStorageService.set('qids_responses', JSON.stringify(qids_responses));

                // if we are using the remote storage scheme, send to
                // server (for now, just do this anyway)
                return $resource(BACKEND_URL + '/qids_responses').save(response).$promise;
            },
            clear_cache: function() {
                localStorageService.remove('qids_responses');
            }
        };
    })

    .factory('Timepoints', function(localStorageService, BACKEND_URL, $resource) {
        // Might use a resource here that returns a JSON array We
        // should be querying the intermediate data service after
        // checking the local data store


        // just look at this sneaky javascript - return an anonymous
        // object with the following methods
        return {
            all: function() {

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
