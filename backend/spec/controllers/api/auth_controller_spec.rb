require 'rails_helper'

RSpec.describe Api::AuthController, :type => :controller do


  describe "POST authenticate" do
    
    it "responds HTTP 200 on successful login" do
      user = create(:user)
      post :authenticate, {username: user.username, password: user.password}

      expect(response.status).to be 200
    end

    it "responds with token on successful login" do
      user = create(:user)
      post :authenticate, {username: user.username, password: user.password}

      expect(JSON.parse(response.body)['auth_token']).to be_truthy
    end

    it "responds HTTP 401 on unsuccessful login" do
      user = create(:user)
      post :authenticate, {username: user.username, password: "wrongpass"}

      expect(response.status).to be 401
    end

    it "responds provides no token on unsuccessful login" do
      user = create(:user)
      post :authenticate, {username: user.username, password: "wrongpass"}

      expect(JSON.parse(response.body)['auth_token']).to be_falsey
    end

  end

end
