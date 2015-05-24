class CreateMessagePreferences < ActiveRecord::Migration
  def change
    create_table :message_preferences do |t|
      t.references, :user
      t.references, :category
      t.boolean :preference

      t.timestamps null: false
    end
  end
end
