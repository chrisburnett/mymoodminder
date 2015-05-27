

class Scheduler

  # handy map of time periods NOTE - this isn't ideal, they should be
  # in some global configuration. That's for another day, for now
  # we're baking them into the scheduler. Sorry.
  def self.periods
    {
    morning: [7,11],
    afternoon: [12,17],
    evening: [18,23]
    }
  end

  # return a random time during the interval the following day
  def self.random_time(period)
    (Date.tomorrow + rand(periods[period][0]..periods[period][1]).hour +
     rand(0..60).minutes).to_datetime
  end

  
  def self.generate_message(user, categories)
    # pick a message preset from the (preferred) categories and create
    # it, and create a notification to go with it
    # get the user's preferences
    # filter categories, exclude only on basis of explicitly not preferred
    preferences = user.message_preferences
    preferred_categories = categories.reject do |c|
      (pref = preferences.find_by(category_id: c.id)) && !pref.state
    end
    # get a random preferred category and a random preset from it
    preset = preferred_categories.sample.presets.sample
    user.messages.build(preset_id: preset.id)
  end
  
end
