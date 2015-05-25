require 'rails_helper'

RSpec.describe MessagePreference, :type => :model do

  describe "Create message preference" do
    it "saves a message preference" do
      create(:user_with_prefs, preferences_count: 5)
      expect(MessagePreference.all.length).to be 5
    end
  end
  
end
