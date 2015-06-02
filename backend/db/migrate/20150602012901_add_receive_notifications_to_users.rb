class AddReceiveNotificationsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :receive_notifications, :boolean
  end
end
