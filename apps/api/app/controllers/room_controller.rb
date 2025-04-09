include Pagy::Backend

class RoomController < ApplicationController
  def index
    rooms = Room.all
    render json: rooms.as_json
  end

  def show
    begin
      @room = Room.find(params[:id])
      if @room.nil?
        render json: { error: "Room not found" }, status: :not_found
      else
        render json: @room.as_json
      end
    
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Room not found" }, status: :not_found
    end
  end

  def create
  begin
    @room = Room.new(name: params[:name])
    if @room.save
      render json: @room.as_json
    else
      render json: { error: @room.errors.full_messages }, status: :unprocessable_entity
    end

  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotUnique => e
    render json: { error: "Room name already exists" }, status: :unprocessable_entity
  end
end

  def create_member
    room = Room.find(params[:id]) 
    user = User.find(params[:user_id])
    @room_member = RoomMember.find_or_create_by(room: room, user: user) 

    if @room_member.persisted? # Check if find_or_create_by was successful (either found or created)
      render json: @room_member.as_json, status: :created
    else
      render json: { error: @room_member.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show_members
    room = Room.find(params[:id])
    room_members = RoomMember.where(room_id: room.id)
    render json: room_members.as_json(only: [:id, :room_id, :user_id], include: { user: { only: [:id, :name] } })
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
    chat = Chat.send_message(room.id, user.id, params[:message]) 

    if chat.persisted?
      render json: chat.as_json, status: :created 
    else
      render json: { error: chat.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
