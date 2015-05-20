class Category < ActiveRecord::Base

  has_many :presets
  has_many :messages, through: :presets 
  
end
