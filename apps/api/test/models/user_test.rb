require "test_helper"

class UserTest < ActiveSupport::TestCase
  # test create 1 user
  test "create user" do
    @user = User.create(username: "test")
    assert_equal "test", @user.username
  end
end
