class User < ApplicationRecord
  validates :username, presence: true

  def as_json
    {
      id: id,
      username: username
    }
  end
end
