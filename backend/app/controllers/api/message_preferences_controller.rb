class Api::MessagePreferencesController < SecureAPIController

  def create
    # if there's already a preference for this category, just update
    # it with the new state
    if @current_user then
      pref = @current_user.message_preferences
        .find_or_create_by(category_id: params[:category_id])
      pref.state = params[:state]
      pref.save
      render json: pref, status: :ok
    else
      fail NotAuthenticatedError
    end
  end

  def index
    if @current_user then
      resp = @current_user.message_preferences
      render json: resp, status: :ok
    else
      fail NotAuthenticatedError
    end
  end



  private

  def safe_params
    params.require(:message_preference).permit(:user_id, :category_id, :state)
  end

end
