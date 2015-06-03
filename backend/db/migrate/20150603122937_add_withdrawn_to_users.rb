class AddWithdrawnToUsers < ActiveRecord::Migration
  def change
    add_column :users, :withdrawn, :boolean
  end
end
