import { faker } from '@faker-js/faker';
import React from 'react';
import { pusher } from '@/utils/pusher.util';
import { InputMessage } from '@/components/ui/Message/Input';
import { IMessage } from './components/ui/Message/Message';
import { useApiGetMessages, useApiPostMessage, useApiPostUser } from '@/components/resource/apiResource';
import { IAPIMessage } from '@/types/message.types';
import { Room, User } from '@/types/general.types';
import { useAutoScroll } from '@/utils/scroll.util';
import { mapApiMessageToIMessage } from '@/utils/message-mapper.util';
import { Sidebar } from './components/ui/Sidebar';
import { ChatHeader } from './components/ui/ChatHeader';
import { MessageList } from './components/ui/Message/List';

export const App: React.FC = () => {
  const [room] = React.useState<Room>({ id: '1', name: 'random-chat' });
  const [user, setUser] = React.useState<User>({ id: 0, username: faker.internet.username() });
  const [content, setContent] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  const [{ data: userCreated }] = useApiPostUser(user.username);
  const [{ data: listMessages }] = useApiGetMessages(room.id, {});
  const [, pushMessage] = useApiPostMessage(room.id, user.id, content);

  React.useEffect(() => {
    if (userCreated) setUser(userCreated);
  }, [userCreated]);

  React.useEffect(() => {
    if (listMessages?.data) {
      const sortedMessages = [...listMessages.data].sort((a, b) => Number(a.id) - Number(b.id));
      setMessages(sortedMessages.map(mapApiMessageToIMessage));
    }
  }, [listMessages]);

  React.useEffect(() => {
    const channel = pusher.subscribe('simple-live-chat');
    const handler = (data: IAPIMessage) => {
      setMessages((prev) => [...prev, mapApiMessageToIMessage(data)]);
    };

    channel.bind('new-chat', handler);
    return () => {
      channel.unbind('new-chat', handler);
      pusher.unsubscribe('simple-live-chat');
    };
  }, []);

  React.useEffect(() => {
    if (content.trim()) {
      pushMessage(content);
    }
  }, [content]);

  useAutoScroll(messages);

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-800">
      <div className="w-[60%] h-[80%] rounded-[32px] shadow-2xl flex">
        <Sidebar />

        <section className="w-3/4 flex flex-col bg-gray-100 rounded-r-[32px]">
          <ChatHeader room={room} user={user} />
          <MessageList messages={messages} currentUser={user} />
          <div className="h-16 p-2 flex items-center">
            <InputMessage onSend={setContent} />
          </div>
        </section>
      </div>
    </div>
  );
};
