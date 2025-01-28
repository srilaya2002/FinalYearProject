import React from 'react';

const ChatMessage = ({ botMessage }) => {
  // Check if the message is from the user or the bot
  const isUserMessage = botMessage.sender === 'user';

  // Styling for different message types
  const messageStyle = {
    display: 'flex',
    justifyContent: isUserMessage ? 'flex-end' : 'flex-start', // Align user messages to the right, bot messages to the left
    padding: '5px 10px',
    margin: '5px 0',
  };

  const bubbleStyle = {
    maxWidth: '70%',
    padding: '10px',
    borderRadius: '15px',
    backgroundColor: isUserMessage ? '#d1f7c4' : '#f1f1f1', // Green for user, light gray for bot
    border: isUserMessage ? '1px solid #a0d98d' : '1px solid #ccc',
    wordWrap: 'break-word',
  };

  return (
    <div style={messageStyle}>
      <div style={bubbleStyle}>
        <p>{botMessage.message}</p>
        {botMessage.source && (
          <small>
            Source: <a href={botMessage.source} target="_blank" rel="noopener noreferrer">{botMessage.source}</a>
          </small>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
