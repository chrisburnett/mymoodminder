require 'rails_helper'

# the methods on the application controller deal mainly with API
# authentication requirements shared by all the subclass controllers,
# so that's what we'll test here

RSpec.describe SecureAPIController, :type => :controller do

  controller do
    def index
      render nothing: true, status: :ok
    end
  end
  
  before(:each) do
    @current_user = create(:user_with_responses, qids_response_count: 5)
    @token = @current_user.generate_auth_token
  end
  
  it "sets the current user if given a valid token" do
    request.headers['Authorization'] = 'Bearer ' + @token
    get :index
    expect(response.status).to be 200
  end

  it "doesn't set the current user if token is missing" do
    get :index
    expect(response.status).to be 401
  end

  it "doesn't set the current user if given an invalid token" do
    request.headers['Authorization'] = 'Bearer rubbishrubbish'
    get :index
    expect(response.status).to be 401
  end

  it "returns HTTP 419 if the given token has expired" do
    allow(Time).to receive(:now).and_return(7.months.from_now)
    request.headers['Authorization'] = 'Bearer ' + @token
    get :index
    expect(response.status).to be 419
    
  end
  
end
