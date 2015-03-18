class QidsResponsesController < ApplicationController
  def create
    user = User.find(params[:user_id])
    if user then
      user.qids_responses.create(safe_params)
      render json: task, status: 201
    end
  end

  private
  
  def safe_params
    params.require(:qids_response).permit(:user_id,
                                          :completed_at, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8, :q9, :q10,
                                          :q11, :q12, :q13, :q14, :q15, :q16, :score)
  end
end
