class Api::UsersController < SecureAPIController

  def show
    if @current_user then
      render json: @current_user, status: :ok
    else
      fail NotAuthenticatedError
    end
  end

  def update
    if @current_user then
      @current_user.attributes = safe_params
      @current_user.save(validate: false)
      render json: @current_user, status: :ok
    else
      fail NotAuthenticatedError
    end
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
  
  def safe_params
    params.require(:user).permit(:receive_notifications, :withdrawn, :delivery_preference, :password)
  end
  
  

end
