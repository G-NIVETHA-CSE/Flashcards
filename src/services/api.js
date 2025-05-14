
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://flashcards-backend-0n09.onrender.com';


const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const authService = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return response.json();
  },
  
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  },
  
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }
    
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const deckService = {
  getDecks: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/decks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching decks:', error);
      throw error;
    }
  },
  
  getDeck: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/decks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deck:', error);
      throw error;
    }
  },
  
  createDeck: async (deckData) => {
    try {
      const response = await axios.post(`${API_URL}/api/decks`, deckData);
      return response.data;
    } catch (error) {
      console.error('Error creating deck:', error);
      throw error;
    }
  },

  addCardsToDeck: async (deckId, cards) => {
    try {
      const response = await axios.post(`${API_URL}/api/decks/${deckId}/cards`, { cards });
      return response.data;
    } catch (error) {
      console.error('Error adding cards to deck:', error);
      throw error;
    }
  }
};
export const statsService = {
  getUserStats: async () => {
    const response = await fetch(`${API_URL}/api/stats/user`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch statistics');
    }
    
    return response.json();
  },

  getDeckStats: async (deckName) => {
    const response = await fetch(`${API_URL}/api/stats/deck/${deckName}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch deck statistics');
    }
    
    return response.json();
  },

  recordStats: async (statsData) => {
    const response = await fetch(`${API_URL}/api/stats`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statsData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to record statistics');
    }
    
    return response.json();
  },
  
  resetStats: async () => {
    const response = await fetch(`${API_URL}/api/stats/reset`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset statistics');
    }
    
    return response.json();
  },
};