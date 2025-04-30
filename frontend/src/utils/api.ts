import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Change to your backend URL

export const fetchAISuggestions = async (userId: string) => {
  const response = await axios.post(`${API_BASE_URL}/finance/get-suggestions`, { userId });
  return response.data;
};

export const sendChatMessage = async (message: string) => {
  const response = await axios.post(`${API_BASE_URL}/chatbot`, { message });
  return response.data;
};
