class AddGpContactToUser < ActiveRecord::Migration
  def change
    add_column :users, :gp_contact_number, :string
  end
end
