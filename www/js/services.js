angular.module('trump.services', [])

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
