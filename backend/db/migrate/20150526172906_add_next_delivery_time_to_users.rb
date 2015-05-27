class AddNextDeliveryTimeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :next_delivery_time, :datetime
  end
end
