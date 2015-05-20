class AddPresetToMessages < ActiveRecord::Migration
  def change
    add_reference :messages, :preset, index: true
    add_foreign_key :messages, :presets
  end
end
