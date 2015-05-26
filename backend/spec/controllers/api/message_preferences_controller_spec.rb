require 'rails_helper'


RSpec.describe Api::MessagePreferencesController, :type => :controller do

  before(:each) do
    @current_user = create(:user)
    @category = create(:category)
    controller.instance_variable_set(:@current_user, @current_user)
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
  
  
end
