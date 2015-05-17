class Api::UsersController < SecureAPIController

  def index
    users = User.all
    render json: users, status: 201
  end
  

end
