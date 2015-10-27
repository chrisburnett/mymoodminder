class Admin::UsersController < ApplicationController

  def update
    # just some convenience setting here for user attributes
    u = User.find(safe_params[:user_id])
    if safe_params[:next_delivery_time] == 'reset' then
      u.next_delivery_time = Time.now
    end
	
	if safe_params[:next_qids_reminder_time] && DateTime.parse(safe_params[:next_qids_reminder_time]) then
	  #ex: 13/10/2015 09:10:00 +0100'
	  gmtFlag = " +0000"
	  date = DateTime.parse(safe_params[:next_qids_reminder_time] + gmtFlag)
      u.next_qids_reminder_time = date
    end
    #if safe_params[:next_qids_reminder_time] == 'reset' then
    #  u.next_qids_reminder_time = Time.now
	#  #u.next_qids_reminder_time = DateTime.tomorrow
    #end
	
    if safe_params[:gp_contact_number] then
      u.gp_contact_number = safe_params[:gp_contact_number]
    end
    u.save(validate: false)
    render json: u, status: :ok
  end


  def export
    send_data User.to_csv, filename: 'user_profiles.csv'
  end

  def export_events
    u = User.find(params[:id])
    send_data u.events_to_csv, filename: "user_#{u.id}_events.csv"
  end

  def export_qids
    u = User.find(params[:id])
    send_data u.qids_to_csv, filename: "user_#{u.id}_qids.csv"
  end

  def export_messages
    u = User.find(params[:id])
    send_data u.messages_to_csv, filename: "user_#{u.id}_messages.csv"
  end




  private
  
  def safe_params
    params.require(:user).permit(:id, :user_id, :next_delivery_time, :next_qids_reminder_time, :gp_contact_number)
  end

end
