require 'rails_helper'


RSpec.describe Api::MessagePreferencesController, :type => :controller do

  before(:each) do
    @current_user = create(:user)
    @category = create(:category)
    controller.instance_variable_set(:@current_user, @current_user)
  end

  describe "GET index" do
    it "does not return preferences for non-preferable categories" do
      c1 = create(:category)
      c2 = create(:category, preferable: false)
      create(:message_preference, user: @current_user, category: c1)
      create(:message_preference, user: @current_user, category: c2)
      get :index
      expect(JSON.parse(response.body).length).to be 1
    end
    
  end
  

  describe "POST index" do
    
    it "creates a preference" do
      post :create, message_preference: attributes_for(:message_preference, user_id: @current_user.id, category_id: @category.id, state: true)
      expect(response.status).to be 200
      expect(@current_user.message_preferences.length).to be 1
    end

    it "doesn't create conflicting preferences" do
      post :create, message_preference: attributes_for(:message_preference, user_id: @current_user.id, category_id: @category.id, state: true)
      post :create, message_preference: attributes_for(:message_preference, user_id: @current_user.id, category_id: @category.id, state: false)
      expect(@current_user.message_preferences.length).to be 1
    end
    
  end

  describe "POST mass_update" do
    it "updates or creates preferences from a JSON array" do
      c1 = create(:category)
      c2 = create(:category)
      c3 = create(:category)
      prefs = [
               attributes_for(:message_preference, user_id: @current_user.id, category_id: c1.id, state: true),
               attributes_for(:message_preference, user_id: @current_user.id, category_id: c2.id, state: true),
               attributes_for(:message_preference, user_id: @current_user.id, category_id: c3.id, state: true)        
              ]
      post :mass_update, message_preference: prefs
      expect(@current_user.message_preferences.length).to be 3
    end
  end
end
