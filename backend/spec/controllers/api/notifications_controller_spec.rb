require 'rails_helper'
require 'spec_helper'

RSpec.describe Api::NotificationsController, :type => :controller do

  describe "POST index" do
    it "responds with HTTP 403 when user is not admin" do
      @current_user = create(:user)
      controller.instance_variable_set(:@current_user, @current_user)
      post :create, content: "test_notification", user_id: @current_user.id
      expect(response.status).to be 403
    end
    
    it "responds with HTTP 201 when user is admin" do
      @current_user = create(:admin)
      controller.instance_variable_set(:@current_user, @current_user)
      post :create, content: "test_notification", user_id: @current_user.id
      expect(response.status).to be 201
    end


  end

end
