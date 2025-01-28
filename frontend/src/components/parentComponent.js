// ParentComponent.js
import React from 'react';
import Chat from './chat';
import { sendMessageToBackend } from './chatWindow';

const ParentComponent = () => {
  const onSendMessage = async (messageText) => {
    try {
      // Send the message to the backend and get the response
      const response = await sendMessageToBackend(messageText);
      return response;
    } catch (error) {
      console.error('Error in onSendMessage:', error);
      return 'Sorry, something went wrong.';
    }
  };

  return <Chat onSendMessage={onSendMessage} />;
};

export default ParentComponent;
