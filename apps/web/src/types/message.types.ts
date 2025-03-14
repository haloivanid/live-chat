import { Room, User } from './general.types';

export interface IAPIMessage {
  id: string;
  created_at: string;
  message: string;
  room_member: {
    user: User;
    room: Room;
  };
}

export interface IApiGetMessages {
  data: IAPIMessage[];
  meta: {
    total_records: number;
    current_page: number;
    total_pages: number;
    next_page: number;
  };
}

export interface Message {
  id: string;
  datetime: number;
  content: string;
  from: User;
}
