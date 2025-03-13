class RootController < ApplicationController
  def index
    render json: { status: "Hello" }
  end
end
