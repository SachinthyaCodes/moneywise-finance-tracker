// frontend/utils/api.ts

export const fetchData = async () => {
  try {
    const response = await fetch("/api/data");

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;  // Rethrow the error to be handled elsewhere
  }
};
