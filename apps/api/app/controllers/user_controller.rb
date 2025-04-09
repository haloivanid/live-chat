class UserController < ApplicationController  
  def show
    begin
      @user = User.find(params[:id])
      if @user.nil?
        render json: { error: "User not found" }, status: :not_found
      else
        render json: @user.as_json
      end
    rescue ActiveRecord::RecordNotFound
      render json: { error: "User not found" }, status: :not_found
    end
  end

  def create
    @user = User.new(username: params[:username])
    if @user.save
      render json: @user.as_json
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
