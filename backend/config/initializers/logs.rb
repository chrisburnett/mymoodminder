event_logfile = File.open("#{Rails.root}/log/event.log", 'a')
event_logfile.sync = true
EVENT_LOG = ActiveSupport::TaggedLogging.new(Logger.new(event_logfile))
