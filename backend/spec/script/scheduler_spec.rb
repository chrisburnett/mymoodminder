require_relative '../../script/scheduler.rb'
require 'rails_helper'
require 'spec_helper'

RSpec.describe Scheduler do

  before(:each) do
    # random seed so it's the same every time
    #srand(12345)
  end

  describe "random_time" do
    it "generates a random time in the given interval" do
      t = Scheduler.random_time(:morning)
      # t > 7 am tomorrow and before 12pm tomorrow
      expect(t).to be > (Date.tomorrow + (Scheduler.periods[:morning][0]).hour).to_datetime
      expect(t).to be < (Date.tomorrow + (Scheduler.periods[:morning][1]).hour + 1).to_datetime
      # + 1 becayse 60 minutes added
    end
  end

  describe "generate_message" do
    it "generates a random message from the user's preferred categories" do
      u = create(:user)
      c1 = create(:category)
      c2 = create(:category)
      create(:preset, category: c1)
      create(:preset, category: c2)
      create(:message_preference, user: u, category: c2, state: false)
      message = Scheduler.generate_message(u, Category.all)
      # expect the message to not be in an explicitly not preferred
      # category, i.e. 
      expect(message.preset.category.id).to eq(c1.id)
    end
  end
  
  
end
