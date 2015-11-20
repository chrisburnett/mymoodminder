require 'csv'

class User < ActiveRecord::Base
  include Authentication

  has_many :qids_responses
  has_many :messages
  has_many :message_preferences
  has_many :events
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
    self.delivery_preference ||= 'anytime'
    self.receive_notifications ||= true
    self.next_delivery_time = Time.now.to_datetime

    self.next_qids_reminder_time = Time.now + 1.week
    # allow users to immediately imput QIDS
    #self.next_qids_reminder_time = Time.now
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

    # privacy settings - all ON to begin with. That means participants
    # are not making the policy any more relaxed during the trial than
    # it was at the beginning
    %w(qids_answers qids_scores qids_notes messages message_prefs).each do |p|
      self.send("share_#{p}=", true)
    end

    self.messages.create(content: "Welcome to My Mood Minder.")

    self.save(validate: false)
  end


  def generate_auth_token
    payload = { user_id: self.id }
    EVENT_LOG.tagged(DateTime.now, 'AUTH', self.id) { EVENT_LOG.info('Generated new auth token') }
    Authentication::AuthToken.encode(payload)
  end


  def events_to_csv(options={})
    CSV.generate(options) do |csv|
      csv << Event.column_names
      events.each do |event|
        csv << event.attributes.values_at(*Event.column_names)
      end
    end
  end

  def qids_to_csv(options={})
    CSV.generate(options) do |csv|
      csv << QidsResponse.column_names
      qids_responses.each do |response|
        csv << response.attributes.values_at(*QidsResponse.column_names)
      end
    end
  end

  def messages_to_csv(options={})
    CSV.generate(options) do |csv|
      csv << Message.column_names
      messages.each do |message|
        csv << message.attributes.values_at(*Message.column_names)
      end
    end
  end


  def self.to_csv
    CSV.generate do |csv|
      cols = column_names.reject { |c| c == 'password_digest' }
      csv << cols
      all.each do |user|
        csv << user.attributes.values_at(*cols)
      end
    end
  end

  def send_notification(content, type, category="")
    # send a notification to this user's registered device
    # only do this id there's a registered device
	if self.receive_notifications || "#{type}" == "reminder" then # we never want reminder notifications to be disabled
    #if self.receive_notifications then
      if self.registration_id then
        n = Rpush::Gcm::Notification.new
        n.app = Rpush::Gcm::App.find_by_name(RPUSH_GCM_APP_NAME)
        n.registration_ids = [self.registration_id]
        n.data = { message: content, category: category, title: TITLE_APP_NAME, type: type }
        n.save!
        EVENT_LOG.tagged(DateTime.now, 'GCM', self.id) { EVENT_LOG.info('Sent notification to device') }
        self.events.create(description: "Notification (#{type}) sent to device")
        self.events.create(description: "Notification, id: (#{self.id}), reg id: (#{self.registration_id})")
      end
    else
      EVENT_LOG.tagged(DateTime.now, 'GCM', self.id) { EVENT_LOG.info('Notification queued but not sent to device - user preference') }
      self.events.create(description: "Notification (#{type}) queued but not sent to device (user preference)")
    end

  end

end
