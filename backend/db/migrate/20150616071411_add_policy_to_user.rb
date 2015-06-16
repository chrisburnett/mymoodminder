class AddPolicyToUser < ActiveRecord::Migration
  def change
    add_column :users, :share_qids_answers, :boolean
    add_column :users, :share_qids_scores, :boolean
    add_column :users, :share_qids_notes, :boolean
    add_column :users, :share_messages, :boolean
    add_column :users, :share_message_prefs, :boolean
  end
end
