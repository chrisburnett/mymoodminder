class Api::MessagesController < SecureAPIController

  # creating a message
  def create
    if @current_user then
      resp = @current_user.messages.create(safe_params)
      render json: resp, status: 201
    else
      fail NotAuthenticatedError
    end
  end

  # checking for messages
  def index
    if @current_user then
      # we need to check the message preferences and block those which
      # are unwanted
      messages = []
      prefs = @current_user.message_preferences
      @current_user.messages.each do |message|
        # if the message doesn't have a preset/category, then user
        # preferences don't apply
        if message.preset then
          # if there's an explicit negative
          # preference, don't put it else put it. There should only ever
          # be one preference, but we take the first anyway
          pref = prefs.where(category_id: message.preset.category.id)
          if pref.empty? || pref.first.state then messages << message end
        else
          messages << message
        end
      end
      render json: messages, status: 200
    else
      fail NotAuthenticatedError
    end
  end
  
  
  private

  def safe_params
    params.require(:message).permit(:user_id, :sender_id, :content)
  end
  
      
end
