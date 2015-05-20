class CreatePresets < ActiveRecord::Migration
  def change
    create_table :presets do |t|
      t.text :content
      t.references :category, index: true

      t.timestamps null: false
    end
    add_foreign_key :presets, :categories
  end
end
