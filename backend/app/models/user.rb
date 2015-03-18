class User < ActiveRecord::Base
  has_many :qids_responses
end
