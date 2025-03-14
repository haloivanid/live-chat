import { IMessage } from '@/components/ui/Message/Message';
import { IAPIMessage } from '@/types/message.types';

export const mapApiMessageToIMessage = (message: IAPIMessage): IMessage => ({
  id: message.id,
  from: {
    id: message.room_member.user.id,
    username: message.room_member.user.username,
  },
  datetime: new Date(message.created_at).getTime(),
  content: message.message,
});
