require 'csv'
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
case Rails.env
when 'development'
  User.create(username: 'john', password: 'johnjohn', admin: false)
  User.create(username: 'dave', password: 'davedave', admin: true)
end

# import canned text messages
CSV.foreach("script/messages.csv") do |row|
  
end
