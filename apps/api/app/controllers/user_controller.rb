class UserController < ApplicationController  
  def show
    @user = User.find(params[:id])
    render json: @user.as_json
  end

  def create
    @user = User.create(username: params[:username])
    render json: @user.as_json
  end
end
