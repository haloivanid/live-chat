import { User } from '@/types/general.types';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface IMessage {
  id: string;
  datetime: number;
  content: string;
  from: User;
}

interface MessageProps {
  message: IMessage;
  groupWithPrev: boolean;
  currentUser: User;
}

const MessageComponent: React.FC<MessageProps> = ({ message, groupWithPrev, currentUser }) => {
  const isSelf = message.from.id === currentUser.id;
  const containerClasses = twMerge('w-full flex flex-row', isSelf ? 'justify-end' : 'justify-start');

  const bubbleClasses = twMerge(
    'max-w-[80%] p-4 shadow-md',
    !groupWithPrev && 'min-w-[220px]',
    isSelf ? 'bg-lime-100' : 'bg-sky-100',
    groupWithPrev ? 'rounded-2xl' : isSelf ? 'rounded-l-2xl rounded-br-2xl' : 'rounded-r-2xl rounded-bl-2xl',
  );

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        {!groupWithPrev && (
          <>
            <div className="flex flex-row justify-between items-center gap-x-2">
              <div className="max-w-[100px] text-sm font-bold text-gray-800 truncate cursor-default">
                {message.from.username}
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

export const Message = React.memo(MessageComponent, areEqual);
