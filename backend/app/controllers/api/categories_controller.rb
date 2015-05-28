# this controller doesn't require a valid JWT token
class Api::CategoriesController < ApplicationController

  def index
    render json: Category.all, status: :ok
  end
  
end
