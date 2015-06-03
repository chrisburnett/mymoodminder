require 'rails_helper'
require 'spec_helper'

RSpec.describe Api::QidsResponsesController, :type => :controller do

  # create and set a test user
  before(:each) do
    @current_user = create(:user_with_responses, qids_response_count: 5)
    controller.instance_variable_set(:@current_user, @current_user)
  end

  describe "GET index" do
    it "responds with HTTP 200" do
      get :index
      expect(response.status).to be 200
    end

    it "responds with JSON list of QIDS responses" do
      get :index
      expect(JSON.parse(response.body).length).to be 5
    end
    # for now, no edit
    it "responds not authenticated if user is withdrawn" do
      @current_user.withdrawn = true
      @current_user.save(validate: false)
      get :index
      expect(response.status).to be 401
    end
  end

  describe "POST index" do
    it "responds with HTTP 201" do
      post :create, qids_response: attributes_for(:qids_response)
      expect(response.status).to be 201
    end

    it "responds with JSON success message of new object" do
      attrs = attributes_for(:qids_response)
      post :create, qids_response: attrs
      expect(JSON.parse(response.body)["completed_at"]).to eq(attrs[:completed_at])
    end
    
  end
  
end
