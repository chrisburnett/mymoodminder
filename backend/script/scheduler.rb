class Scheduler

  # handy map of time periods NOTE - this isn't ideal, they should be
  # in some global configuration. That's for another day, for now
  # we're baking them into the scheduler. Sorry.
  def self.periods
    {
      morning: [7,11],
      afternoon: [12,17],
      evening: [18,23],
      anytime: [7,23]
    }
  end

  # return a random time during the interval the following day
  def self.random_time(period)
    (Date.today + rand(periods[period][0]..periods[period][1]).hour +
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
    # get a random preferred category and a random preset from it Tue
    # Jun 2 16:53:28 2015 - don't do this now: instead, put all the
    # presets from perferred categories in a bag and choose one. This
    # is to give a bit more weight to the medication advice category
    all_presets = []
    preferred_categories.each do |cat|
      all_presets += cat.presets
    end
    user.messages.build(preset_id: all_presets.sample.id)
  end

end
