require 'rails_helper'
require 'spec_helper'
RSpec.describe Api::MessagesController, :type => :controller do

  before(:each) do
    @current_user = create(:user_with_messages, messages_count: 5)
    controller.instance_variable_set(:@current_user, @current_user)
  end

  describe "GET index" do
    it "responds with HTTP 200" do
      get :index
      expect(response.status).to be 200
    end
    it "responds with a list of JSON messages" do
      get :index
      expect(JSON.parse(response.body).length).to be 5
    end
  end

  describe "POST index" do
    it "responds with HTTP 201" do
      post :create, message: attributes_for(:message)
      expect(response.status).to be 201
    end

    it "responds with JSON success message of new object" do
      attrs = attributes_for(:message)
      post :create, message: attrs
      expect(JSON.parse(response.body)["content"]).to eq(attrs[:content])
    end

  end

end
