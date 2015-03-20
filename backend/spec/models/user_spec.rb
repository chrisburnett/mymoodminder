require 'rails_helper'
require 'spec_helper'

RSpec.describe User, :type => :model do
  it "fails because no password" do
    expect(User.new({:username => "hans"}).save).to be false
    
  end
  
  it "fails because password to short" do
    expect(User.new({:username => "hans", 
              :password => 'han'}).save).to be false
  end
  
  it "succeeds because password is long enough" do
    expect(User.new({:username => "hans",
              :password => 'hansohanso'}).save).to be true
  end

end

