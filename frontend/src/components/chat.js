import React, { useState, useEffect } from 'react';
import axios from "axios";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    MessageInput,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import ChatMessage from './chatMessage'; // Adjust the path to where you saved ChatMessage.js

import { fetchWithAuth } from '../utils/apiHelper';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
    const [isWaitingForSpecs, setIsWaitingForSpecs] = useState(false);
    const [socket, setSocket] = useState(null);
    const [input, setInput] = useState(""); // Manage input state
    const [isProcessing, setIsProcessing] = useState(false); 

    // Initialize WebSocket connection
    const initializeWebSocket = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found. Redirecting to login...');
            window.location.href = '/login';
            return;
        }

        const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);
        ws.onopen = () => console.log('WebSocket connection established.');
        let lastMessage = "";

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.message === lastMessage) return; // Skip duplicate messages
                lastMessage = data.message;

                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        message: data.message,
                        direction: 'incoming',
                        sender: 'bot',
                        source: data.source || "WebSocket", // Add source here
                    },
                ]);

                // Check for follow-up states
                if (data.message.toLowerCase().includes('what changes would you like')) {
                    setIsWaitingForSpecs(true);
                    setIsWaitingForConfirmation(false);
                } else if (data.message.toLowerCase().includes('do you like this plan?')) {
                    setIsWaitingForConfirmation(true);
                    setIsWaitingForSpecs(false);
                } else {
                    setIsWaitingForSpecs(false);
                    setIsWaitingForConfirmation(false);
                }
            } catch (err) {
                console.error('Error parsing WebSocket message:', err, event.data);
            }
        };

        ws.onclose = (event) => {
            console.warn(`WebSocket closed: ${event.reason}. Reconnecting in 3 seconds...`);
            setTimeout(() => initializeWebSocket(), 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket encountered an error:', error.message);
        };

        setSocket(ws);
    };

    useEffect(() => {
        initializeWebSocket();
        return () => socket?.close();
    }, []); // Run only once on mount


    const handleSend = async () => {
        if (!input.trim()) return;

        if (isProcessing) return;
        
        setIsProcessing(true);  // Set to true when processing starts
        console.log("Sending message:", input);

        // Add user message to the chat
        const userMessage = { message: input, direction: 'outgoing', sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        try {
            if (input.toLowerCase().includes('nutritional info')) {
                const apiUrl = "http://127.0.0.1:8000/api/v1/fetch-nutrition";
                console.log("Fetching API URL (nutritional query):", apiUrl);
            
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ query: input }),
                });
            
                if (response.ok) {
                    const data = await response.json();
                    console.log("Nutritional data response:", data);
            
                    const botMessage = {
                        message: data.message,
                        direction: "incoming",
                        sender: "bot",
                        source: data.source || "Unknown", // Add the source
                    };
            
                    const detailedMessages = (data.data || []).map((item) => ({
                        message: `${item.name} - Calories: ${item.calories}, Protein: ${item.protein}, Carbs: ${item.carbs}, Fats: ${item.fats}`,
                        direction: "incoming",
                        sender: "bot",
                        source: data.source || "Unknown", // Add the source to detailed messages too
                    }));
            
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        botMessage,
                        ...detailedMessages,
                    ]);
                } else {
                    const errorData = await response.json();
                    console.error("Nutritional API error:", errorData);
                    throw new Error(`Nutrition API Error: ${errorData.detail || 'Unknown error'}`);
                }
            }
             else if (
                input.toLowerCase().includes('what should i be eating now') ||
                input.toLowerCase().includes('next meal') ||
                input.toLowerCase().includes('current meal')
            ) {
                const apiUrl = "http://127.0.0.1:8000/api/v1/current-meal";
                console.log("Fetching API URL (current meal):", apiUrl);

                const response = await fetchWithAuth(apiUrl, { method: 'GET' });
                console.log("Current meal response:", response);

                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        message: response.message,
                        direction: 'incoming',
                        sender: 'bot',
                        source: 'Diet Plan API', // Add source from API
                    },
                ]);
            } else if (socket && socket.readyState === WebSocket.OPEN) {
                console.log("Sending message via WebSocket:", input);
                socket.send(JSON.stringify({ message: input }));
            } else {
                const apiUrl = "http://127.0.0.1:8000/api/v1/chat";
                console.log("Fetching API URL (fallback query):", apiUrl);

                const response = await fetchWithAuth(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: input }),
                });

                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        message: response.message,
                        direction: 'incoming',
                        sender: 'bot',
                        source: 'OpenAI', // Add source here
                    },
                ]);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    message: 'Sorry, something went wrong. Please try again later.',
                    direction: 'incoming',
                    sender: 'bot',
                    source: 'Error', // Add source as error
                },
            ]);
        } finally {
            setIsProcessing(false);
            setInput(""); // Clear the input field
        }
    };

    return (
        <div style={{ position: "relative", height: "500px" }}>
            <MainContainer>
                <ChatContainer>
                     <MessageList>
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} botMessage={msg} />
                            ))}
                            </MessageList>
                    <MessageInput
                        value={input}
                        onChange={(value) => setInput(value)}
                        placeholder={
                            isWaitingForSpecs
                                ? "Specify changes for your diet plan."
                                : isWaitingForConfirmation
                                ? "Type 'yes' to confirm or 'no' to reject."
                                : "Type your message here"
                        }
                        onSend={handleSend}
                    />
                </ChatContainer>
            </MainContainer>
        </div>
    );
};

export default Chat;
