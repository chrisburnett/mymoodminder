class AddPreferableToCategory < ActiveRecord::Migration
  def change
    add_column :categories, :preferable, :boolean
  end
end
