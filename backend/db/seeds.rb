require 'csv'
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
# import canned text messages
# start by scanning and creating categories
categories = {}
data = CSV.read("script/messages.csv")
data.each do |category_title, message_preset|
  categories[category_title] ||= Category.create(title: category_title)
  categories[category_title].presets.create(content: message_preset)
end

case Rails.env
when 'development'
  User.create(username: 'john', password: 'johnjohn', admin: false)
  User.create(username: 'dave', password: 'davedave', admin: true)

when 'production'
  User.create(username: 'dameramu', password: 'dameramudameramu', admin: true)
end

# create entries for rpush - this creates a bit of state outside unit
# tests, careful
app = Rpush::Gcm::App.new
app.name = "trump_app"
app.auth_key = "AIzaSyDxTnjBOvdFyx0XJl5oPzkVurCluTh6C9A"
app.connections = 1
app.save!
