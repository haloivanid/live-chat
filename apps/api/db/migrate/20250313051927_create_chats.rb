class CreateChats < ActiveRecord::Migration[8.0]
  def change
    create_table :chats do |t|
      t.string :message, limit: 500
      t.references :room_member, null: false, foreign_key: true

      t.timestamps
    end
  end
end
