class Admin::DashboardController < ApplicationController

  def index
    @message = Message.new
    
  end
  

end
