require 'rails_helper'


RSpec.describe Message, :type => :model do

  
  describe "Create message" do

    before(:each) do
      create(:user_with_messages, messages_count: 5)
    end
    
    it "saves a message to the database" do
      expect(Message.all.length).to be 5
    end


  end



end
