class Api::MessagePreferencesController < ApplicationController

  def create
    if @current_user then
      resp = @current_user.message.create(safe_params)
      render json: resp, status: 201
    else
      fail NotAuthenticatedError
    end
  end

  def index
    if @current_user then
      resp = @current_user.message_preferences
      render json: resp, status: 200
    else
      fail NotAuthenticatedError
    end
  end



  private

  def safe_params
    params.require(:message_preference).permit(:user_id, :category_id)
  end

end
