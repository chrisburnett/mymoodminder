require 'rpush'
require_relative '../../script/scheduler.rb'


namespace :messaging do

  desc "Check pending users and generate messages+notifications"
  task generate_messages: :environment do
    # go through all the users
    User.all.each do |user|
      # if it's time for a message, generate one from given categories
      if user.next_delivery_time < Time.now then

        message = Scheduler.generate_message(user, Category.all)
        message.save
        user.send_notification(message.preset.content, :message, message.preset.category)
        # then generate and update the next message time
        user.next_delivery_time = Scheduler.random_time(user.delivery_preference.to_sym) + 1.day

      end

      if user.next_qids_reminder_time < Time.now then

        user.send_notification("Please create a weekly entry", :reminder)
        user.next_qids_reminder_time = Scheduler.random_time(user.delivery_preference.to_sym) + 6.days
      end
      user.save(validate: false)

    end
  end

  desc "Push pending notifications to registered devices"
  task push_notifications: :environment do

    Rpush.push

  end

  task deliver: [:generate_messages,
                 :push_notifications]

end


