class AddLocalStorageToUsers < ActiveRecord::Migration
  def change
    add_column :users, :local_storage, :boolean
  end
end
