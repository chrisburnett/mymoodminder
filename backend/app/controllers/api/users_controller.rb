class Api::UsersController < SecureAPIController

  def show
    if @current_user then
      @current_user.events.create(description: "Accessed: user profile")
      render json: @current_user, status: :ok
    else
      fail NotAuthenticatedError
    end
  end

  def update
    if @current_user then
      @current_user.attributes = safe_params
      @current_user.save(validate: false)
      @current_user.events.create(description: "Updated: user profile: #{safe_params}")
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
      @current_user.events.create(description: "Created: user device registration #{registration_id}")
      render json: @current_user.registration_id, status: :ok
    else
      fail NotAuthenticatedError
    end
  end

  def safe_params
    params.require(:user).permit(:receive_notifications, :withdrawn, :delivery_preference, :password, :share_qids_answers, :share_qids_scores, :share_qids_notes, :share_messages, :share_message_prefs)
  end



end
