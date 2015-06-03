require 'rails_helper'
require 'spec_helper'

RSpec.describe Api::UsersController, :type => :controller do

  before(:each) do
    @current_user = create(:user)
    controller.instance_variable_set(:@current_user, @current_user)
  end

  describe "GET index" do
    it "responds with HTTP 200" do
      get :show
      expect(response.status).to be 200
    end

    it "responds with the user's profile" do
      get :show
      expect(JSON.parse(response.body)['forename']).to eq("Chris")
    end
  end

  describe "PUT index" do
    it "sets the current user's notification flag" do
      put :update, { user: { receive_notifications: false } }
      expect(JSON.parse(response.body)['receive_notifications']).to be_falsey
    end

    it "sets the current user's delivery preference" do
      put :update, { user: { delivery_preference: 'anytime' } }
      expect(JSON.parse(response.body)['delivery_preference']).to eq('anytime')
    end
  end
end
