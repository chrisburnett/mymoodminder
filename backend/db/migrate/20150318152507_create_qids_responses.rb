class CreateQidsResponses < ActiveRecord::Migration
  def change
    create_table :qids_responses do |t|
      t.references :user, index: true
      t.datetime :completed_at
      t.string :q1
      t.string :q2
      t.string :q3
      t.string :q4
      t.string :q5
      t.string :q6
      t.string :q7
      t.string :q8
      t.string :q9
      t.string :q10
      t.string :q11
      t.string :q12
      t.string :q13
      t.string :q14
      t.string :q15
      t.string :q16
      t.integer :score

      t.timestamps null: false
    end
    add_foreign_key :qids_responses, :users
  end
end
