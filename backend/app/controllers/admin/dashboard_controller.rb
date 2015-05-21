class Admin::DashboardController < ApplicationController

  def index
    @message = Message.new
    @logevents = LogEvent.all
  end
  

end
