class RemovePreferenceFromMessagePreferences < ActiveRecord::Migration
  def change
    remove_column :message_preferences, :preference, :boolean
  end
end
