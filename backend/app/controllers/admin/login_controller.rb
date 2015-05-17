class Admin::LoginController < ApplicationController


  # we don't need a token for the login controller
  skip_before_action :authenticate_request

  # show the login page
  def index
  end
  
  def authenticate
    puts "hey #{params[:username]}"
    user = User.find_by_username(params[:username]).try(:authenticate, params[:password])
    
    if user.admin?
      render :nothing, status: :ok
    else
      render :nothing, status: :unauthorized
    end
  end
  
  
end
