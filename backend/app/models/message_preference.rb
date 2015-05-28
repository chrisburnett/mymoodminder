class MessagePreference < ActiveRecord::Base

  belongs_to :user
  belongs_to :category

  delegate :title, to: :category, allow_nil: true

  def as_json(options)
    super(options).merge({title: title})
  end
  
  
end

