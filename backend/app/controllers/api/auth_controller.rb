class Api::AuthController < ApplicationController
  skip_before_action :authenticate_request # this will be implemented later
  def authenticate
    user = User.find_by_username(params[:username]).try(:authenticate, params[:password])

  
    if user
      response.headers['X-CSRF-Token'] = form_authenticity_token
      render json: { auth_token: user.generate_auth_token }
    else
      render json: { error: 'Invalid username or password' }, status: :unauthorized
    end
  end
end
