class Api::QidsResponsesController < ApplicationController

  # protect_from_forgery with: :null_session
  
  def create
    user = User.find(params[:user_id])
    if user then
      resp = user.qids_responses.create(safe_params)
      render json: resp, status: 201
    end
  end

  def index
    user = User.find(params[:user_id])
    responses = user.qids_responses
    render json: responses, status: 201
  end
  

  private
  
  def safe_params
    params.require(:qids_response).permit(:user_id,
                                          :completed_at, :q1, :q2, :q3, :q4, :q5, :q6_7, :q8_9, :q10,
                                          :q11, :q12, :q13, :q14, :q15, :q16, :score)
  end
end
