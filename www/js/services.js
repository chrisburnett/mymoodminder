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

    .factory('QuestionnaireText', function() {
        return {
            q1: {
                q: "1. Falling asleep",
                1: "I never take longer than 30 minutes to fall asleep.",
                2: "I take at least 30 minutes to fall asleep, less than half the time.",
                3: "I take at least 30 minutes to fall asleep, more than half the time.",
                4: "I take more than 60 minutes to fall asleep, more than half the time."
            },
            q2: {
                q: "2. Sleeping at night",
                1: "I do not wake up at night.",
                2: "I have a restless, light sleep with a few brief awakenings each night.",
                3: "I wake up at least once a night, but I go back to sleep easily.",
                4: "I awaken more than once a night and stay awake for 20 minutes or more, more than half the time."
            },
            q3: {
                q: "3. Waking up too early",
                1: "Most of the time, I awaken no more than 30 minutes before I need to get up.",
                2: "More than half the time, I awaken more than 30 minutes before I need to get up.",
                3: "I almost always awaken at least one hour or so before I need to, but I go back to sleep eventually.",
                4: " I awaken at least one hour before I need to, and can't go back to sleep."
            },
            q4: {
                q: "4. Sleeping too much",
                1: "I sleep no longer than 7-8 hours/night, without napping during the day.",
                2: "I sleep no longer than 10 hours in a 24-hour period including naps.",
                3: "I sleep no longer than 12 hours in a 24-hour period including naps.",
                4: "I sleep longer than 12 hours in a 24-hour period including naps."
            },
            q5: {
                q: "5. Feeling sad",
                1: "I do not feel sad.",
                2: "More than half the time, I awaken more than 30 minutes before I need to get up.",
                3: "I almost always awaken at least one hour or so before I need to, but I go back to sleep eventually.",
                4: "I awaken at least one hour before I need to, and can't go back to sleep."
            },
            q6: {
                q: "6. Decreased appetite",
                1: "There is no change in my usual appetite.",
                2: "I eat somewhat less often or lesser amounts of food than usual.",
                3: "I eat much less than usual and only with personal effort.",
                4: "I rarely eat within a 24-hour period, and only with extreme personal effort or when others persuade me to eat."
            },
            q7: {
                q: "7. Increased appetite ",
                1: "There is no change from my usual appetite.",
                2: "I feel a need to eat more frequently than usual.",
                3: "I regularly eat more often and/or greater amounts of food than usual.",
                4: "I feel driven to overeat both at mealtime and between meals."
            },
            q8: {
                q: "8. Decreased weight (within the last two weeks)",
                1: "I have not had a change in my weight.",
                2: "I feel as if I have had a slight weight loss.",
                3: "I have lost 2 pounds or more.",
                4: "I have lost 5 pounds or more."
            },
            q9: {
                q: "9. Increased weight (within the last two weeks)",
                1: "I have not had a change in my weight.",
                2: "I feel as if I have had a slight weight gain.",
                3: "I have gained 2 pounds or more.",
                4: "I have gained 5 pounds or more."
            },
            q10: {
                q: "10. Concentration and decision making",
                1: "There is no change in my usual capacity to concentrate or make decisions.",
                2: "I occasionally feel indecisive or find that my attention wanders.",
                3: "Most of the time, I struggle to focus my attention or to make decisions.",
                4: "I cannot concentrate well enough to read or cannot even make minor decisions."
            },
            q11: {
                q: "11. View of myself",
                1: "I see myself as equally worthwhile and deserving as other people.",
                2: "I am more self-blaming than usual.",
                3: "I largely believe that I cause problems for others.",
                4: "I think almost constantly about major and minor defects in myself."
            },
            q12: {
                q: "12. Thoughts of death or suicide",
                1: "I do not think of suicide or death.",
                2: "I feel that life is empty or wonder if it's worth living.",
                3: "I think of suicide or death several times a week for several minutes.",
                4: "I think of suicide or death several times a day in some detail, or I have made specific plans for suicide, or have actually tried to take my life."
            },
            q13: {
                q: "13. General interest",
                1: "I do not think of suicide or death.",
                2: "I notice that I am less interested in people or activities.",
                3: "I find I have interest in only one or two of my formerly pursued activities.",
                4: "I have virtually no interest in formerly pursued activities."
            },
            q14: {
                q: "14. Energy level",
                1: "There is no change in my usual level of energy.",
                2: "I get tired more easily than usual.",
                3: "I have to make a big effort to start or finish my usual daily activities (for example, shopping, homework, cooking, or going to work).",
                4: "I really cannot carry out most of my usual daily activities because I just don't have the energy."
            },
            q15: {
                q: "15. Feeling slowed down",
                1: "I think, speak, and move at my usual rate of speed.",
                2: "I find that my thinking is slowed down or my voice sounds dull or flat.",
                3: "It takes me several seconds to respond to most questions and I'm sure my thinking is slowed.",
                4: "I am often unable to respond to questions without extreme effort."
            },
            q16: {
                q: "16. Feeling restless",
                1: "I do not feel restless.",
                2: "I'm often fidgety, wringing my hands, or need to shift how I am sitting.",
                3: "I have impulses to move about and am quite restless.",
                4: "At times, I am unable to stay seated and need to pace around."
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
