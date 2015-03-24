FactoryGirl.define do

  factory :qids_response do
    q1 "a"
    q2 "b"
    score "20"
    completed_at "2015-03-21T12:24:26.000Z"
    user
  end
  
  
  factory :user do
    username "dameramu"
    forename "Chris"
    surname "Burnett"
    password "ukelele"

    factory :user_with_responses do
      
      transient do
        qids_response_count 5
      end
      
      after(:create) do |user, evaluator|
        create_list(:qids_response, evaluator.qids_response_count, user: user)
      end
    end
  end
end
