# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
$(document).ready ->
  $("#new_message").on("ajax:success", (e, data, status, xhr) ->
    new_message_button = $("[name='commit']")
    new_message_button.addClass('btn-success')
    setTimeout(->
      new_message_button.removeClass('btn-success')
    , 2000)
  ).on "ajax:error", (e, xhr, status, error) ->
    new_message_button = $("[name='commit']")
    new_message_button.addClass('btn-error')
    setTimeout(->
      new_message_button.removeClass('btn-error')
    , 2000)
