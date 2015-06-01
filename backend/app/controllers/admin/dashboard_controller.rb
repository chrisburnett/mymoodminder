#require_relative '../../../script/scheduler.rb'

class Admin::DashboardController < ApplicationController


  def index
    if session[:user_id] then
      @message = Message.new
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
        user.send_notification('test broadcast', :message)
        user.send_notification("Please create a weekly entry", :reminder)
      end
      Rpush.push
      render nothing: true, status: :ok
    else
      redirect_to admin_login_url
    end
  end


end
