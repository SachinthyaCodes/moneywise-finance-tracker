const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios'); // For making HTTP requests to your backend API

// Base URL of your backend (Change this to the URL of your backend API)
const BASE_URL = 'http://localhost:5000'; // Assuming your backend is running on port 5000

// Function to test adding a recurring bill
async function testAddRecurringBill() {
  try {
    const response = await axios.post(`${BASE_URL}/recurring-bills`, {
      name: 'Netflix Subscription',
      amount: 15.99,
      billingCycle: 'MONTHLY',
      startDate: '2025-03-25',
      dueDate: '2025-04-25',
      paymentMethod: 'CREDIT_CARD',
      autoPay: true,
      userId: 1, // Assuming userId 1 exists
    });
    console.log('Recurring Bill Added:', response.data);
  } catch (error) {
    console.error('Error adding recurring bill:', error.response?.data || error.message);
  }
}

// Function to test fetching all recurring bills
async function testGetAllRecurringBills() {
  try {
    const response = await axios.get(`${BASE_URL}/recurring-bills`);
    console.log('Recurring Bills:', response.data);
  } catch (error) {
    console.error('Error fetching recurring bills:', error.response?.data || error.message);
  }
}

// Function to test updating a recurring bill
async function testUpdateRecurringBill(id) {
  try {
    const response = await axios.put(`${BASE_URL}/recurring-bills/${id}`, {
      name: 'Updated Netflix Subscription',
      amount: 17.99,
      billingCycle: 'MONTHLY',
      startDate: '2025-03-25',
      dueDate: '2025-04-25',
      paymentMethod: 'PAYPAL',
      autoPay: false,
    });
    console.log('Recurring Bill Updated:', response.data);
  } catch (error) {
    console.error('Error updating recurring bill:', error.response?.data || error.message);
  }
}

// Function to test deleting a recurring bill
async function testDeleteRecurringBill(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/recurring-bills/${id}`);
    console.log('Recurring Bill Deleted:', response.data);
  } catch (error) {
    console.error('Error deleting recurring bill:', error.response?.data || error.message);
  }
}

// Test the functions

// Uncomment the test you want to run

// Add a new recurring bill
// testAddRecurringBill();

// Fetch all recurring bills
// testGetAllRecurringBills();

// Update an existing recurring bill (provide the id of the bill)
// testUpdateRecurringBill('some-recurring-bill-id');

// Delete an existing recurring bill (provide the id of the bill)
// testDeleteRecurringBill('some-recurring-bill-id');
