require 'test_helper'

class RoomControllerTest < ActionController::TestCase
  setup do
    @room = rooms(:one)
    @user = users(:one)
    @message = chats(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_equal @room.as_json, JSON.parse(response.body).first
  end

  test "should get show" do
    get :show, params: { id: @room.id }
    assert_response :success
    assert_equal @room.as_json, JSON.parse(response.body)
  end

  test "shouldn't get show with invalid id" do
    get :show, params: { id: 'invalid' }
    assert_response :not_found
  end

  test "should create room" do
    post :create, params: { name: 'test' }
    assert_response :success
    assert_equal 'test', JSON.parse(response.body)['name']
  end

  test "shouldn't create room with invalid params" do
    post :create, params: { 'invalid': 'params' }
    assert_response :unprocessable_entity
  end

  test "shouldn't create room if name exists" do
    post :create, params: { name: @room.name }
    assert_equal 'Room name already exists', JSON.parse(response.body)['error']
  end

  test "should create room member" do
    post :create_member, params: { id: @room.id, user_id: @user.id }
    assert_response :success
  end

  test "should send message" do
    post :send_message, params: { id: @room.id, user_id: @user.id, message: 'test' }
    assert_response :success
  end

  test "should get messages" do
    get :show_messages, params: { id: @room.id }
    assert_response :success
    assert_equal @message.message, JSON.parse(response.body)['data'].first['message']
  end
end