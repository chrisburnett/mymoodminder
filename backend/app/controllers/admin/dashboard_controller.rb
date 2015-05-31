require 'rake'

Rails.application.load_tasks

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
      Rake::Task['messaging:deliver'].invoke
      render nothing: true, status: :ok
    else
      redirect_to admin_login_url
    end
  end
  

end
