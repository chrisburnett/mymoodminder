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

  after_create :init


  # set a default value for the delivery preference. I don't like the
  # magic string here, but it's the most straightforward way of
  # dealing with this for now.
  def init
    self.delivery_preference ||= 'afternoon'
    self.next_delivery_time = Time.now.to_datetime
    self.next_qids_reminder_time = Time.now + 1.week
    # when a user is created, set up default message preferences for
    # each category. Note: this assumes that the categories have been
    # loaded... By default receive everything

    # only create preferences in the app for categories we have marked
    # as preferable, that is, the user is allowed to set delivery
    # preferences for those categories. Medication advice and attitude
    # shifters are (for the moment) exempt
    Category.where(preferable: true).each do |category|
      self.message_preferences.create(category_id: category.id, state: true)
    end
    self.save(validate: false)
  end
  

  def generate_auth_token
    payload = { user_id: self.id }
    Authentication::AuthToken.encode(payload)
  end


  def send_notification(content, type)
    # send a notification to this user's registered device
    # only do this id there's a registered device
    if self.registration_id then
      n = Rpush::Gcm::Notification.new
      n.app = Rpush::Gcm::App.find_by_name(RPUSH_GCM_APP_NAME)
      n.registration_ids = [self.registration_id]
      n.data = { message: content, title: TITLE_APP_NAME, type: type }
      n.save!
    end
  end

end
