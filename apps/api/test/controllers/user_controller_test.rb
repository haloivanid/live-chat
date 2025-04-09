require 'test_helper'

class UserControllerTest < ActionController::TestCase
  test 'should show user' do
    user = User.create(username: 'testuser')
    get :show, params: { id: user.id }
    assert_response :success
    assert_equal user.as_json.to_json, response.body
  end

  test 'should create user' do
    assert_difference 'User.count' do
      post :create, params: { username: 'newuser' }
    end
    assert_response :success
    assert_equal User.last.as_json, JSON.parse(response.body)
  end

  test 'should not create user with invalid params' do
    assert_no_difference 'User.count' do
      post :create, params: { invalid_param: 'value' }
    end
    assert_response :unprocessable_entity
  end

  test 'should not show user with invalid id' do
    get :show, params: { id: 'invalid_id' }
    assert_response :not_found
  end
end