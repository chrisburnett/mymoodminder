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
# start by scanning and creating categories
categories = {}
data = CSV.read("script/messages.csv")
data.each do |category_title, message_preset|
  categories[category_title] ||= Category.create(title: category_title)
  categories[category_title].presets.create(content: message_preset)
end


