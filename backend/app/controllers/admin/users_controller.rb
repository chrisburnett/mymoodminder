class Admin::UsersController < ApplicationController

  def update
    # just some convenience setting here for user attributes
    
    u = User.find(params[:id])
    if safe_params[:next_delivery_time] == 'reset' then
      u.next_delivery_time = Time.now
    end
    if safe_params[:next_qids_reminder_time] == 'reset' then
      u.next_qids_reminder_time = Time.now
    end
    u.save(validate: false)
    render json: u, status: :ok
  end
  
  private

  def safe_params
    params.require(:user).permit(:id, :next_delivery_time, :next_qids_reminder_time, :gp_contact_number)
  end
  
end
