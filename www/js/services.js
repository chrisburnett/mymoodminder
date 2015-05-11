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
                // update this before sending to server
                var qids_responses = localStorageService.get('qids_responses') || {};
                var d = $q.defer();

                // use the date and time of completion as the key
                // locally, but also set it as a property so it gets
                // uploaded at sync
                var completed_at = response.completed_at;
                if(!completed_at) {
                    completed_at = (new Date()).toISOString();
                    response.completed_at = completed_at;
                }

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
                        localStorageService.set('qids_responses', JSON.stringify(qids_responses));
                    }
                    d.resolve(reason);
                });
                return d.promise;
            },
            clear_cache: function() {
                localStorageService.remove('qids_responses');
            },
            sync_pending: function() {
                // for each pending response in localstorage, try to save.
                var qids_responses = localStorageService.get('qids_responses');
                // collect up all the promises so that we can resolve them as one
                var promises = [];
                if(qids_responses)
                    for(var i = 0; i < qids_responses.length; i++)
                        if(qids_responses[i].pending) promises.push(this.save(qids_responses[i]));
 
                return $q.all(promises);
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
