class ApplicationController < ActionController::Base

  helper_method :current_user, :logged_in?
  
  private

  def authenticate_user
    if session[:user_id] then
      @current_user ||= session[:user_id] && User.find(session[:user_id])
    else
      redirect_to admin_login_url
    end
  end
  
  def current_user
    @current_user ||= session[:user_id] && User.find(session[:user_id])
  end

  def logged_in?
    current_user != nil
  end
  
end
