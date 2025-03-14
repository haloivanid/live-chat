import { IMessage, Message } from '@/components/ui/Message/Message';
import { User } from '@/types/general.types';
import { twMerge } from 'tailwind-merge';

export const MessageList: React.FC<{ messages: IMessage[]; currentUser: User }> = ({ messages, currentUser }) => (
  <div
    id="chat-window-body"
    className={twMerge('flex-1 bg-gray-300 overflow-y-auto p-4', 'flex flex-col gap-2 scroll-smooth scrollable')}
  >
    {messages.map((message, index) => {
      const prevMessage = messages[index - 1];
      const sameAsPrev = index > 0 && message.from.id === prevMessage.from.id;
      const validDate = index > 0 && message.datetime - prevMessage.datetime < 60000;

      return (
        <Message key={message.id} message={message} groupWithPrev={sameAsPrev && validDate} currentUser={currentUser} />
      );
    })}
  </div>
);
