import React, { useState, useEffect } from 'react';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { fetchWithAuth } from '../utils/apiHelper'; // Import fetchWithAuth utility

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Track API call state
    const [socket, setSocket] = useState(null); // WebSocket instance

    // Function to initialize WebSocket connection
    const initializeWebSocket = () => {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        if (!token) {
            console.error('No token found. Redirecting to login...');
            window.location.href = '/login'; // Redirect to login if token is missing
            return;
        }

        const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`); // Include token in WebSocket URL

        ws.onopen = () => {
            console.log('WebSocket connected');
        };
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const botMessage = {
                    message: data.message,
                    direction: 'incoming',
                    sender: 'bot',
                };

                setMessages((prevMessages) => [...prevMessages, botMessage]);

                if (data.message.toLowerCase().includes('do you like this plan?')) {
                    setIsWaitingForConfirmation(true);
                } else {
                    setIsWaitingForConfirmation(false);
                }
            } catch (err) {
                console.error("Error parsing WebSocket message:", err, event.data);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        message: "Sorry, something went wrong with the server response.",
                        direction: 'incoming',
                        sender: 'bot',
                    },
                ]);
            }
        };

        ws.onclose = (event) => {
            console.warn(`WebSocket closed: ${event.reason}. Reconnecting in 3 seconds...`);
            setTimeout(initializeWebSocket, 3000); // Reconnect after 3 seconds
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);
    };

    useEffect(() => {
        initializeWebSocket(); // Initialize WebSocket connection on component mount

        return () => {
            if (socket) socket.close(); // Clean up WebSocket on component unmount
        };
    }, []); // Run only once on mount

    const handleSend = async (messageText) => {
        if (isLoading) return;

        const userMessage = {
            message: messageText,
            direction: 'outgoing',
            sender: 'user',
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ message: messageText }));
        } else {
            setIsLoading(true);
            try {
                const response = await fetchWithAuth('http://127.0.0.1:8000/api/v1/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: messageText }),
                });

                const botMessage = {
                    message: response.message,
                    direction: 'incoming',
                    sender: 'bot',
                };
                setMessages((prevMessages) => [...prevMessages, botMessage]);

                if (response.message.toLowerCase().includes('do you like this plan?')) {
                    setIsWaitingForConfirmation(true);
                } else {
                    setIsWaitingForConfirmation(false);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        message: 'Sorry, something went wrong. Please try again later.',
                        direction: 'incoming',
                        sender: 'bot',
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div style={{ position: 'relative', height: '500px' }}>
            <MainContainer>
                <ChatContainer>
                    <MessageList>
                        {messages.map((msg, index) => (
                            <Message key={index} model={msg} />
                        ))}
                    </MessageList>
                    <MessageInput
                        placeholder={
                            isWaitingForConfirmation
                                ? "Type 'yes' to confirm or 'no' to reject the new plan."
                                : 'Type your message here'
                        }
                        onSend={handleSend}
                        disabled={isLoading}
                    />
                </ChatContainer>
            </MainContainer>
        </div>
    );
};

export default Chat;
