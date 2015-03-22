class User < ActiveRecord::Base
  include Authentication
  
  has_many :qids_responses

  has_secure_password

  validates :password,
            length: { minimum: 5 },
            presence: true

  validates :username,
            uniqueness: true, presence: true


  
  def generate_auth_token
    payload = { user_id: self.id }
    Authentication::AuthToken.encode(payload)
  end
  
end
