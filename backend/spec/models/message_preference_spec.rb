require 'rails_helper'

RSpec.describe MessagePreference, :type => :model do

  describe "Message preferences" do
    it "should initially contain no preferences" do
      user = create(:user)
      expect(user.message_preferences.empty?).to be true
    end
  end
  
  describe "Create message preference" do
    it "saves a message preference" do
      user = create(:user)
      create(:message_preference, user: user)
      expect(user.message_preferences.empty?).to be false
    end
  end
  
end
