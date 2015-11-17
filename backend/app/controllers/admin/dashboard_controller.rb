#require_relative '../../../script/scheduler.rb'

class Admin::DashboardController < ApplicationController


  def index
    if session[:user_id] then
      @message = Message.new
      @users = User.all
      @logevents = `tail -n 25 #{Rails.root}/log/event.log`.split("\n")
    else
      redirect_to admin_login_url
    end
  end

  # run the rake task to push notifications
  def deliver
    if session[:user_id] then
      EVENT_LOG.tagged(DateTime.now, 'ADMIN') { EVENT_LOG.info('Test-firing message push to devices') }
      User.all.each do |user|
        if rand > 0.5
          user.send_notification('test broadcast', :message)
        else
          user.send_notification("Please create a weekly entry", :reminder)
        end
      end
      Rpush.push
      render nothing: true, status: :ok
    else
      redirect_to admin_login_url
    end
  end

  # run the rake task to push notifications
  # Does not work
  def reset_registration_ids
    if session[:user_id] then
      user = User.find(11)
      user.update_attribute(:registration_id, "XX")
      #User.all.each do |user|
      #  if user.id == 11 then
      #    user.update_attribute(:registration_id, "XX")
      #    #user.registration_id = ""
      #    #user.save(validate: false)
      #  end
      #end
      render nothing: true, status: :ok
   else
      redirect_to admin_login_url
   end
  end

end
