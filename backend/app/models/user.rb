class User < ActiveRecord::Base
  include Authentication

  has_many :qids_responses
  has_many :messages
  has_many :message_preferences
  
  has_secure_password

  validates :password,
  length: { minimum: 5 },
  presence: true

  validates :username,
  uniqueness: true, presence: true

  after_initialize :init


  # set a default value for the delivery preference. I don't like the
  # magic string here, but it's the most straightforward way of
  # dealing with this for now.
  def init
    self.delivery_preference ||= 'afternoon'
  end

  def generate_auth_token
    payload = { user_id: self.id }
    Authentication::AuthToken.encode(payload)
  end


  def send_notification(content)
    # send a notification to this user's registered device
    # only do this id there's a registered device
    if self.registration_id then
      n = Rpush::Gcm::Notification.new
      n.app = Rpush::Gcm::App.find_by_name(RPUSH_GCM_APP_NAME)
      n.registration_ids = [self.registration_id]
      n.data = { message: content }
      n.save!
    end
  end

end
