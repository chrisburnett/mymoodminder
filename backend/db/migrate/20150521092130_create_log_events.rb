class CreateLogEvents < ActiveRecord::Migration
  def change
    create_table :log_events do |t|
      t.text :content
      t.string :type

      t.timestamps null: false
    end
  end
end
