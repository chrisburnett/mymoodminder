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
      resp = @current_user.messages
      render json: resp, status: 200
    else
      fail NotAuthenticatedError
    end
  end
  
  
  private

  def safe_params
    params.require(:message).permit(:user_id, :sender_id, :content)
  end
  
      
end
