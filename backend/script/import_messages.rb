require 'csv'

class MessageImporter
  def import
    categories = {}
    data = CSV.read("script/messages.csv")
    data.each do |category_title, message_preset|
      # mark some categories as 'not preferable' - i.e., users can't set a
      # preference for them
      preferable = true
      if category_title === "medication information" then
        preferable = false
      end
      categories[category_title] ||= Category.create(title: category_title, preferable: preferable)
      categories[category_title].presets.create(content: message_preset)
    end
  end
end
