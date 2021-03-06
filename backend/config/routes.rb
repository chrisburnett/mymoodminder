Rails.application.routes.draw do

  namespace :api, defaults: {format: :json} do
    resource :user
    resources :qids_responses, only: [:index, :create, :update, :destroy]
    resources :messages, only: [:index, :create, :update, :destroy]
    resources :message_preferences, only: [:index, :create, :update, :destroy] do
      get 'mass_update', on: :collection
    end
    resources :notifications, only: [:create]
    resources :categories, only: [:index]
    resources :events, only: [:create]
    # route for authenticating with the AuthController
    post 'auth' => 'auth#authenticate'

    # custom route for registering the user's device ID this is NOT
    # the best way to do this - the railsy way would be to have a
    # restful representation of a registration, so you could have
    # multiple devices for multiple users. But in the interest of
    # saving time, I'm doing it this way.
    # the before filters will take care of getting the user_id
    post 'register' => 'users#register'
  end

  namespace :admin do

    resources :messages
    resources :users

    put 'users' => 'users#update'
    get 'export', to: 'users#export', as: 'export_users'
    get 'users/:id/export_events', to: 'users#export_events', as: 'export_user_events'
    get 'users/:id/export_qids', to: 'users#export_qids', as: 'export_user_qids'
    get 'users/:id/export_messages', to: 'users#export_messages', as: 'export_user_messages'
    get 'login' => 'session#index'
    get 'logout' => 'session#destroy'
    post 'login' => 'session#create'
    get 'dashboard' => 'dashboard#index'
    get 'dashboard/deliver' => 'dashboard#deliver'

  end



  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
