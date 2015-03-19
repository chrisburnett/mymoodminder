class MergeQ8Q9InQidsResponses < ActiveRecord::Migration
  def change
    remove_column :qids_responses, :q8, :string
    remove_column :qids_responses, :q9, :string
    add_column :qids_responses, :q8_9, :string
  end
end
