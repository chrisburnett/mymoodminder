class Message < ActiveRecord::Base
  belongs_to :user
  belongs_to :preset
  belongs_to :user, foreign_key: 'sender_id'

  def after_create(message)    
    # when a message is successfully created on the backend, a
    # notification should go out with the same message in its
    # payload
    n = Rpush::Gcm::Notification.new
    n.app = Rpush::Gcm::App.find_by_name(RPUSH_GCM_APP_NAME)
    n.registration_ids = [message.user.registration_id]
    n.data = { message: message.content}
    n.save!
  end
  
  
end
