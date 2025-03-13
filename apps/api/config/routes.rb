Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "root#index"

  get "/users/:id", to: "user#show"
  post "/users", to: "user#create"

  get "/rooms", to: "room#index"
  get "/rooms/:id", to: "room#show"
  post "/rooms", to: "room#create"
  get "/rooms/:id/members", to: "room#show_members"
  post "/rooms/:id/members", to: "room#create_member"
  get "/rooms/:id/messages", to: "room#show_messages"
  post "/rooms/:id/messages", to: "room#send_message"
end
