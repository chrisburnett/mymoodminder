require 'rpush'

namespace :rpush do
  desc "Push pending notifications to registered devices"
  task push_notifications: :environment do
    puts "Pushing notifications to registered devices..."
    Rpush.push
    puts "Done."
  end

end
