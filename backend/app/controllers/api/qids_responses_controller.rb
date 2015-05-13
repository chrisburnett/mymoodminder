class Api::QidsResponsesController < ApplicationController

  def destroy
    if @current_user then
      resp = @current_user.qids_responses.find(params[:id]).destroy
      render json: resp, status: 201
    end
  end
  
  def create
    if @current_user then
      resp = @current_user.qids_responses.create(safe_params)
      render json: resp, status: 201
    else
      fail NotAuthenticatedError
    end
  end

  def index
    if @current_user then
      responses = @current_user.qids_responses
      render json: responses, status: 200
    else
      fail NotAuthenticatedError
    end
  end
  

  private
  
  def safe_params
    params.require(:qids_response).permit(:user_id,
                                          :completed_at, :q1, :q2, :q3, :q4, :q5, :q6_7, :q8_9, :q10,
                                          :q11, :q12, :q13, :q14, :q15, :q16, :score)
  end
end
