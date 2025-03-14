class UserController < ApplicationController  
  def show
    @user = User.find(params[:id])
    render json: @user.as_json
  end

  def create
    @user = User.new(username: params[:username])
    @user.save

    render json: @user.as_json
  end
end
