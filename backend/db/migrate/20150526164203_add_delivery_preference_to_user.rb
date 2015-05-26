class AddDeliveryPreferenceToUser < ActiveRecord::Migration
  def change
    add_column :users, :delivery_preference, :string
  end
end
