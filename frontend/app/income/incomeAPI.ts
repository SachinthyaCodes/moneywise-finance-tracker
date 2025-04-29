import axios from "axios";

const BASE_URL = "http://localhost:5000/income";

export const getIncome = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const addIncome = async (source: string, amount: number, category: string) => {
  const response = await axios.post(BASE_URL, { source, amount, category });
  return response.data;
};

export const updateIncome = async (id: string, source: string, amount: number, category: string) => {
  const response = await axios.put(`${BASE_URL}/${id}`, { source, amount, category });
  return response.data;
};

export const deleteIncome = async (id: string) => {
  await axios.delete(`${BASE_URL}/${id}`);
};