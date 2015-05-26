class AddStateToMessagePreferences < ActiveRecord::Migration
  def change
    add_column :message_preferences, :state, :boolean
  end
end
