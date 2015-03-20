require_relative '../../lib/util/AuthToken.rb'

class User < ActiveRecord::Base
  has_many :qids_responses

  def generate_auth_token
    payload = { user_id: self.id }
    AuthToken.encode(payload)
  end
  
end
