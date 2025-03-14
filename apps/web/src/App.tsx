import { faker } from '@faker-js/faker';
import React from 'react';
import { IoChatbubble } from 'react-icons/io5';
import { twMerge } from 'tailwind-merge';
import { pusher } from '@/utils/pusher.util';
import { InputMessage } from '@/components/ui/Message/Input';
import { Message } from './components/ui/Message/Message';

interface User {
  id: string;
  name: string;
}

interface IAPIMessage {
  id: string;
  created_at: string;
  message: string;
  room_member: {
    user: {
      id: string;
      username: string;
    };
    room: {
      id: string;
      name: string;
    };
  };
}

const useAutoScroll = (...deps: React.DependencyList) => {
  React.useEffect(() => {
    const messageBody = document.getElementById('chat-window-body');
    if (messageBody) {
      messageBody.scrollTop = messageBody.scrollHeight;
    }
  }, [deps]);
};

export const App: React.FC = () => {
  const [user, _setUser] = React.useState<User>({
    id: faker.string.uuid(),
    name: faker.person.firstName() + String(Math.floor(100 + Math.random() * 900)),
  });

  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    const channel = pusher.subscribe('simple-live-chat');

    channel.bind('new-chat', (data: IAPIMessage) => {
      const newMessage: Message = {
        id: data.id,
        from: {
          id: data.room_member.user.id,
          name: data.room_member.user.username,
        },
        isSelf: false,
        datetime: new Date(data.created_at).getTime(),
        content: data.message,
      };

      setMessages((prev) => [...prev, newMessage]);

      return () => {
        pusher.unsubscribe('new-chat');
      };
    });
  }, []);

  useAutoScroll(messages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: faker.string.uuid(),
      from: user,
      isSelf: true,
      datetime: Date.now(),
      content,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-800">
      <div className="w-[60%] h-[80%] rounded-[32px] shadow-2xl flex">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-200 rounded-l-[32px] flex flex-col">
          <header className="h-16" />
          <div className="flex-1 bg-gray-400 overflow-y-auto" />
          <footer className="h-16" />
        </aside>

        {/* Chat Area */}
        <section className="w-3/4 flex flex-col bg-gray-100 rounded-r-[32px]">
          <header className="h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <IoChatbubble className="w-8 h-8 text-white" />
              </div>
              <div className="font-bold text-gray-800">Chat with Random</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-300" />
              <div className="w-4 h-4 rounded-full bg-green-300" />
              <div className="w-4 h-4 rounded-full bg-red-300" />
            </div>
          </header>
          <div
            id="chat-window-body"
            className={twMerge(
              'flex-1 bg-gray-300 overflow-y-auto p-4',
              'flex flex-col gap-2 scroll-smooth scrollable',
            )}
          >
            {messages.map((message, index) => {
              const sameAsPrev = index > 0 && message.from.id === messages[index - 1].from.id;
              const validDate =
                index > 0 &&
                new Date(message.datetime).getMinutes() - new Date(messages[index - 1].datetime).getMinutes() < 1;

              return <Message key={message.id} message={message} groupWithPrev={sameAsPrev && validDate} />;
            })}
          </div>
          <div className="h-16 p-2 flex items-center">
            <InputMessage onSend={handleSendMessage} />
          </div>
        </section>
      </div>
    </div>
  );
};
