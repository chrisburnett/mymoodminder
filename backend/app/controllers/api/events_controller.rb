class Api::EventsController < SecureAPIController

  def create
    if @current_user then
      resp = @current_user.events.create(safe_params)
      render json: resp, status: :created
    else
      fail NotAuthenticatedError
    end
  end

  private

  def safe_params
    params.require(:event).permit(:user_id, :description)
  end

end
