class Admin::MessagesController < ApplicationController

  def create
    resp = Message.create(safe_params)
    render json: resp, status: 201
  end
  
  private

  def safe_params
    params.require(:message).permit(:user_id, :content, :sender_id)
  end

end
