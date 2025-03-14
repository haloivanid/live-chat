import { LuSend } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

interface InputMessageProps {
  onSend: (message: string) => void;
}

export const InputMessage: React.FC<InputMessageProps> = ({ onSend }) => {
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
