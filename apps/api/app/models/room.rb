class Room < ApplicationRecord
  validates :name, presence: true

  def as_json
    {
      id: id,
      name: name
    }
  end
end
