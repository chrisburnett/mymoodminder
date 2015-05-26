require 'rails_helper'
require 'spec_helper'

RSpec.describe Api::MessagesController, :type => :controller do

  before(:each) do
    @current_user = create(:user)
    @message = create(:message, user: @current_user)
    controller.instance_variable_set(:@current_user, @current_user)
  end

  describe "GET index" do
    it "responds with HTTP 200" do
      get :index
      expect(response.status).to be 200
    end
    it "responds with a list of JSON messages" do
      get :index
      expect(JSON.parse(response.body).length).to be 1
    end
    it "includes the category title in JSON response" do   
      get :index
      expect(JSON.parse(response.body).first['category']).to eq("be more assertive")
    end
    it "omits messages for which there is a negative preference" do
      create(:message_preference, user: @current_user, category_id: @message.preset.category.id)
      get :index
      expect(JSON.parse(response.body).empty?).to be true
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
