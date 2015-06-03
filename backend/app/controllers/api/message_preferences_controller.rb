class Api::MessagePreferencesController < SecureAPIController

  def create
    # if there's already a preference for this category, just update
    # it with the new state
    if @current_user then
      pref = create_or_update_pref(params[:category_id], params[:state])
      render json: pref, status: :ok
    else
      fail NotAuthenticatedError
    end
  end

  def index
    if @current_user then
      resp = MessagePreference.joins(:category).where(user_id: @current_user.id, categories: { preferable: true }).order(title: :desc)
      render json: resp, status: :ok
    else
      fail NotAuthenticatedError
    end
  end


  def mass_update
    if @current_user then
      params[:message_preference].each do |pref|
        create_or_update_pref(pref[:category_id], pref[:state])
      end
      render json: @current_user.message_preferences
    else
      fail NotAuthenticatedError
    end
  end

  private

  def create_or_update_pref(category, state)
    pref = @current_user.message_preferences
      .find_or_create_by(category_id: category)
    pref.state = state
    pref.save
  end

  def safe_params
    params.require(:message_preference).permit(:user_id, :category_id, :state)
  end

end
