class NotAuthenticatedError < StandardError
end
class AuthenticationTimeoutError < StandardError
end

class ApplicationController < ActionController::Base
  include Authentication
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session
  before_action :set_current_user, :authenticate_request
  #after_filter :set_csrf_cookie_for_ng
  #skip_before_filter :verify_authenticity_token, :if => Proc.new { |c| c.request.format == 'application/json' }
  
  skip_before_action :verify_authenticity_token
  
  rescue_from NotAuthenticatedError do
    render json: { error: 'Not Authorized' }, status: :unauthorized
  end
  rescue_from AuthenticationTimeoutError do
    render json: { error: 'Auth token is expired' }, status: 419 # unofficial timeout status code
  end

   # Based on the user_id inside the token payload, find the user.
  def set_current_user
    if decoded_auth_token
      @current_user ||= User.find(decoded_auth_token[:user_id])
    end
  end

  # Check to make sure the current user was set and the token is not expired
  def authenticate_request
    if auth_token_expired?
      fail AuthenticationTimeoutError
    elsif !@current_user
      fail NotAuthenticatedError
    end
  end

  protected
  
  # return the cached decoded token, or decode if needed
  def decoded_auth_token
    @decoded_auth_token ||= Authentication::AuthToken.decode(http_auth_header_content)
  end

  # check for token expiry
  def auth_token_expired?
    decoded_auth_token && decoded_auth_token.expired?
  end

  # JWT's are stored in the Authorization header using this format:
  # Bearer somerandomstring.encoded-payload.anotherrandomstring
  def http_auth_header_content
    return @http_auth_header_content if defined? @http_auth_header_content
    @http_auth_header_content = begin
      if request.headers['Authorization'].present?
        request.headers['Authorization'].split(' ').last
      else
        nil
      end
    end
  end


end



