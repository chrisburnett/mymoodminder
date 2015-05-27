require 'rpush'
require_relative '../../script/scheduler.rb'

namespace :messaging do

  desc "Check pending users and generate messages+notifications"
  task generate_messages: :environment do
    # go through all the users
    User.all.each do |user|
      # if it's time for a message, generate one from given categories
      if user.next_delivery_time < Time.now then
        puts "Generating message for User #{user.id}"
        message = Scheduler.generate_message(user, Category.all)
        message.save
        user.send_notification(message.preset.content)
        # then generate and update the next message time
        user.next_delivery_time = Scheduler.random_time(user.delivery_preference)
        puts "Next message for User #{user.id} at #{user.next_delivery_time.to_s}"
        user.save
      end
    end
  end

  desc "Push pending notifications to registered devices"
  task push_notifications: :environment do
    puts "Pushing notifications to registered devices..."
    Rpush.push
    puts "Done."
  end

  task deliver: [:generate_messages,
                 :push_notifications]

end


