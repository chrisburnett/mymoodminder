require 'rpush'
require_relative '../../script/scheduler.rb'

event_logfile = File.open("#{Rails.root}/log/event.log", 'a')
event_logfile.sync = true
EVENT_LOG = ActiveSupport::TaggedLogging.new(Logger.new(event_logfile))

namespace :messaging do

  desc "Check pending users and generate messages+notifications"
  task generate_messages: :environment do
    # go through all the users
    User.all.each do |user|
      # if it's time for a message, generate one from given categories
      if user.next_delivery_time < Time.now then
        EVENT_LOG.tagged(DateTime.now, 'MSG', user.id) { EVENT_LOG.info('Generating daily message') }
        message = Scheduler.generate_message(user, Category.all)
        message.save
        user.send_notification(message.preset.content, :message)
        # then generate and update the next message time
        user.next_delivery_time = Scheduler.random_time(user.delivery_preference.to_sym) + 1.day
        EVENT_LOG.tagged(DateTime.now, 'MSG', user.id) { EVENT_LOG.info("Next message at #{user.next_delivery_time.to_s}") }
      end

      if user.next_qids_reminder_time < Time.now then
        EVENT_LOG.tagged(DateTime.now, 'QIDS', user.id) { EVENT_LOG.info("Generating QIDS reminder") }
        user.send_notification("Please create a weekly entry", :reminder)
        user.next_qids_reminder_time = Scheduler.random_time(user.delivery_preference.to_sym) + 6.days
      end
      user.save(validate: false)

    end
  end

  desc "Push pending notifications to registered devices"
  task push_notifications: :environment do
    EVENT_LOG.tagged(DateTime.now, 'GCM') { EVENT_LOG.info("Pushing notifications to devices") }
    Rpush.push
    EVENT_LOG.tagged(DateTime.now, 'GCM') { EVENT_LOG.info("Done.") }
  end

  task deliver: [:generate_messages,
                 :push_notifications]

end


