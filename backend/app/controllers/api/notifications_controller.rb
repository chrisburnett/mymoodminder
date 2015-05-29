class Api::NotificationsController < ApplicationController

  def create
    # only admin users can create notifications
    if @current_user and @current_user.admin?
      resp = User.find(params[:user_id]).send_notification(params[:content], :message)
      render json: resp, status: :created
    else
      render json: { error: 'Forbidden' }, status: :forbidden
    end
  end
  
  
end
