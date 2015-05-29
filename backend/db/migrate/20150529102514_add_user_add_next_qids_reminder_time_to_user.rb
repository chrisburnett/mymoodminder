class AddUserAddNextQidsReminderTimeToUser < ActiveRecord::Migration
  def change
    add_column :users, :next_qids_reminder_time, :datetime
  end
end
