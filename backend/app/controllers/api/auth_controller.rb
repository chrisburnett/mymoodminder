class Api::AuthController < ApplicationController

  # we don't need a token for the login controller
  skip_before_action :authenticate_request

  def authenticate
    user = User.find_by_username(params[:username]).try(:authenticate, params[:password])
    if user && !user.withdrawn
      user.events.create(description: "Authentication: successful login")
      if !user.active then
        user.active = true
        user.save(validate: false)
      end
      render json: { auth_token: user.generate_auth_token }, status: :ok
    else
      render json: { error: 'Invalid username or password' }, status: :unauthorized
    end
  end

  def index

  end


end
