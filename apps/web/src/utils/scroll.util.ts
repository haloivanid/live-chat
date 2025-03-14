import React from 'react';

export const useAutoScroll = (...deps: React.DependencyList) => {
  React.useEffect(() => {
    const messageBody = document.getElementById('chat-window-body');
    if (messageBody) {
      messageBody.scrollTop = messageBody.scrollHeight;
    }
  }, deps);
};
