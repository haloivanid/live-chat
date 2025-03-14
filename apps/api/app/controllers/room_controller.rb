include Pagy::Backend

class RoomController < ApplicationController
  def index
    rooms = Room.all
    render json: rooms.as_json
  end

  def show
    room = Room.find(params[:id])
    render json: room.as_json
  end

  def create
    room = Room.create(name: params[:name])
    render json: room.as_json
  end

  def create_member
    room = Room.find(params[:room_id])
    user = User.find(params[:user_id])
    RoomMember.find_or_create_by(room_id: room_id, user_id: user_id)
  end

  def show_members
    room = Room.find(params[:id])
    room_members = RoomMember.where(room_id: room.id)
    render json: room_members.as_json
  end

  def show_messages
    room_members = RoomMember.where(room_id: params[:id])
    @pagy, @records = pagy(
      Chat.where(room_member_id: room_members.map(&:id)).order(id: :desc), limit: params[:limit] || 20
    )

    @metadata = {
    total_records: @pagy.count,
    current_page: @pagy.page,
    total_pages: @pagy.pages,
    next_page: @pagy.page != @pagy.last,
  }

    render json: { meta: @metadata, data: @records }
  end

  def send_message
    room = Room.find(params[:id])
    user = User.find(params[:user_id])
    Chat.send_message(room.id, user.id, params[:message])
  end
end
