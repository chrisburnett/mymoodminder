angular.module('trump.services', ['LocalStorageModule'])

    .factory('QIDSResponse', function(localStorageService) {
        return {
            // return a service which lets us persist a response
            // between invocations of the app locally (for now) and
            // retrieve it later
            save: function(response) {
                var qids_responses = localStorageService.get('qids_responses');
                if(!qids_responses) qids_responses = {};
                qids_responses[new Date()] = response;
                return localStorageService.set('qids_responses', qids_responses);
            }
        }
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
