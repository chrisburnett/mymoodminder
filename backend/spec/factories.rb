FactoryGirl.define do  factory :message do
    content "MyText"
user nil
  end


  factory :qids_response do
    q1 "2"
    q2 "2"
    q3 "2"
    q5 "2"
    q6_7 "2"
    q8_9 "2"
    q10 "2"
    q11 "2"
    q12 "2"
    q13 "2"
    q14 "2"
    q15 "2"
    q16 "2"
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
