class MergeQ6Q7InQidsResponses < ActiveRecord::Migration
  def change
    remove_column :qids_responses, :q6, :string
    remove_column :qids_responses, :q7, :string
    add_column :qids_responses, :q6_7, :string
  end
end
