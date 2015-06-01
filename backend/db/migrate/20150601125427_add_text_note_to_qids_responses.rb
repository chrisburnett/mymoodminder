class AddTextNoteToQidsResponses < ActiveRecord::Migration
  def change
    add_column :qids_responses, :note, :text
  end
end
