import { faker } from '@faker-js/faker';
import React from 'react';
import { IoChatbubble } from 'react-icons/io5';
import { LuSend } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

// ======================= Types =======================
interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  datetime: number;
  content: string;
  from: User;
  isSelf: boolean;
}

// ======================= Message Component =======================
interface MessageProps {
  message: Message;
  groupWithPrev: boolean;
}

const MessageComponent: React.FC<MessageProps> = ({ message, groupWithPrev }) => {
  const containerClasses = twMerge('w-full flex flex-row', message.isSelf ? 'justify-end' : 'justify-start');

  const bubbleClasses = twMerge(
    'max-w-[80%] p-4 shadow-md',
    !groupWithPrev && 'min-w-[220px]',
    message.isSelf ? 'bg-lime-100' : 'bg-sky-100',
    groupWithPrev ? 'rounded-2xl' : message.isSelf ? 'rounded-l-2xl rounded-br-2xl' : 'rounded-r-2xl rounded-bl-2xl',
  );

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        {!groupWithPrev && (
          <>
            <div className="flex flex-row justify-between items-center gap-x-2">
              <div className="max-w-[100px] text-sm font-bold text-gray-800 truncate cursor-default">
                {message.from.name}
              </div>
              <time className="text-xs text-gray-500">{new Date(message.datetime).toLocaleString()}</time>
            </div>
            <hr className="mb-2 text-gray-300" />
          </>
        )}
        <p className="text-sm text-wrap whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

// Optimized with React.memo and custom comparison
const areEqual = (prevProps: MessageProps, nextProps: MessageProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.groupWithPrev === nextProps.groupWithPrev &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.datetime === nextProps.message.datetime
  );
};

const Message = React.memo(MessageComponent, areEqual);

// ======================= Input Component =======================
interface InputMessageProps {
  onSend: (message: string) => void;
}

const InputMessage: React.FC<InputMessageProps> = ({ onSend }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message')?.toString().trim();

    if (message) {
      onSend(message);
      e.currentTarget.reset();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  return (
    <form className="w-full flex items-center gap-2" onSubmit={handleSubmit}>
      <textarea
        name="message"
        placeholder="Type your message"
        autoComplete="off"
        aria-label="Message input"
        className={twMerge(
          'w-[calc(100%-40px)] h-10 px-4 py-2',
          'focus:outline-none border-[0.5px] border-gray-300',
          'rounded-2xl bg-gray-200 focus:border-lime-600',
          'resize-none overflow-hidden',
        )}
        onKeyDown={handleKeyDown}
        rows={2}
      />
      <button
        type="submit"
        className={twMerge(
          'w-10 h-10 flex items-center justify-center',
          'bg-lime-600 rounded-full hover:bg-lime-700',
          'transition-colors duration-200',
        )}
        aria-label="Send message"
      >
        <LuSend className="w-6 h-6 text-white" />
      </button>
    </form>
  );
};

// ======================= Main App Component =======================
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
