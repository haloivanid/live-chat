import { Room, User } from '@/types/general.types';
import { IoChatbubble } from 'react-icons/io5';

export const ChatHeader: React.FC<{ room: Room; user: User }> = ({ room, user }) => (
  <header className="h-16 flex items-center justify-between px-4">
    <div className="flex items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
        <IoChatbubble className="w-8 h-8 text-white" />
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-gray-800">{room.name}</p>
        <p className="text-xs text-gray-500">{user.username}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {['bg-yellow-300', 'bg-green-300', 'bg-red-300'].map((color) => (
        <div key={color} className={`w-4 h-4 rounded-full ${color}`} />
      ))}
    </div>
  </header>
);
