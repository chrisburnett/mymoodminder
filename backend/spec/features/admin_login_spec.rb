describe 'admin login', :type => :feature do

  it 'signs in a valid admin' do
    visit admin_login_path
    fill_in 'username', with: 'dave'
    fill_in 'password', with: 'davedave'
    click_button 'Login'
    expect(page.status_code).to be 200
  end

  it 'does not sign in a non-admin' do
    visit '/admin/login'
    fill_in 'username', with: 'something'
    fill_in 'password', with: 'else'
    click_button 'Login'
    expect(current_path).to eq(admin_login_path)
  end
end
