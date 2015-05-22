require 'rails_helper'
require 'spec_helper'

RSpec.describe User, :type => :model do

  
  it "fails because no password" do
    user = build(:user, password: nil)
    expect(user.save).to be false
  end

  it "fails because no username" do
    user = build(:user, username: nil)
    expect(user.save).to be false
  end
  
  it "fails because password to short" do
    user = build(:user, password: "sht")
    expect(user.save).to be false
  end
  
  it "succeeds because password is long enough" do
    user = build(:user, password: "longenough")
    expect(user.save).to be true
  end

  it "allows a user to log in with correct credentials" do
    user = create(:user)
    logged_user = User.find_by_username(user.username).authenticate(user.password)
    expect(logged_user).to eq(user)
  end

  it "prevents a user from logging in with incorrect credentials" do
    user = create(:user)
    logged_user = User.find_by_username(user.username).authenticate("wrongpassword")
    expect(logged_user).not_to eq(user)
  end

  describe "send_notification" do
    it "adds a pending notification entry to the database" do
      user = create(:user)
      expect(user.send_notification("test")).to be_truthy
    end
  end
end

