class Message < ActiveRecord::Base
  belongs_to :user
  belongs_to :preset
  belongs_to :user, foreign_key: 'sender_id'

  
  
  
  
end
