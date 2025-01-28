import { API_BASE_URL } from './config';

export const sendMessageToBackend = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error communicating with backend:', error);
    return 'Sorry, something went wrong. Please try again later.';
  }
};
