// apiHelper.js
export const fetchWithAuth = async (url, options = {}) => {
    // Retrieve the token dynamically from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    // Merge headers with Authorization token
    const headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`, // Dynamically include token
    };

    try {
        // Make the API request
        const response = await fetch(url, { ...options, headers });

        // Handle token expiration or unauthorized errors
        if (response.status === 401) {
            console.warn("Token expired or unauthorized. Redirecting to login...");
            localStorage.removeItem("token"); // Clear expired token
            window.location.href = "/login"; // Redirect to login page
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `Error: ${response.statusText}. Details: ${
                    errorData.detail || "No additional information."
                }`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error in fetchWithAuth:", error.message);
        throw error; // Rethrow the error for handling in calling code
    }
};
