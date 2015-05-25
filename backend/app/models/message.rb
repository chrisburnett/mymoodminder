class Message < ActiveRecord::Base
  belongs_to :user
  belongs_to :preset
  belongs_to :user, foreign_key: 'sender_id'
  
  def as_json(options)
    json = super(options)
    #if the message has a preset, append its category also, if the
    # message has a preset, the preset content will take precedence
    # over any explicitly defined content
    if preset then
      json[:category] = preset.category.title
      json[:content] = preset.content
    end

    return json
  end
  
end
