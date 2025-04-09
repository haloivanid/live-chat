class User < ApplicationRecord
  validates :username, presence: true, allow_blank: false

  def as_json
    {
      "id"=> id,
      "username" => username
    }
  end
end
