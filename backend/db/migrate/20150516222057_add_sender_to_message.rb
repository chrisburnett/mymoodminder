class AddSenderToMessage < ActiveRecord::Migration
  def change
    add_reference :messages, :sender, index: true
    add_foreign_key :messages, :users
  end
end
