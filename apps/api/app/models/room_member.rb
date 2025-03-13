class RoomMember < ApplicationRecord
  belongs_to :room
  belongs_to :user

  validates :user_id, uniqueness: { scope: :room_id }

  def as_json
    {
      id: id,
      room: room.as_json,
      user: user.as_json
    }
  end
end
