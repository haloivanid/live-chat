class Chat < ApplicationRecord
  after_create :push
  belongs_to :room_member

  validates :message, presence: true

  def self.send_message(room_id, user_id, message)
    Chat.create(room_member_id: RoomMember.find_or_create_by(room_id: room_id, user_id: user_id).id, message: message)
  end

  def push
    Pusher.trigger('simple-live-chat', 'new-chat', self.as_json)
  end

  def as_json
    {
      id: id,
      message: message,
      created_at: created_at,
      room_member: room_member.as_json
    }
  end
end
