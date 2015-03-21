require_relative '../../lib/util/AuthToken.rb'

class User < ActiveRecord::Base
  has_many :qids_responses

  has_secure_password

  validates :password,
            length: { minimum: 5 },
            presence: true

  validates :username,
            uniqueness: true, presence: true


  
  def generate_auth_token
    payload = { user_id: self.id }
    AuthToken.encode(payload)
  end
  
end
