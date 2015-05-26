class Api::UsersController < SecureAPIController

  def index
    users = User.all
    render json: users, status: :ok
  end

  # set the user's device ID for pushing notifications to Google Cloud
  # Messaging
  def register
    if @current_user then
      @current_user.update_attribute(:registration_id, params[:registration_id])
      render json: @current_user.registration_id, status: :ok
    else
      fail NotAuthenticatedError
    end
  end
  
  

end
