class Room < ApplicationRecord
  validates :name, presence: true, allow_blank: false

  def as_json
    {
      "id"=> id,
      "name"=> name
    }
  end
end
