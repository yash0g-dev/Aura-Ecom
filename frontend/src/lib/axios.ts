import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000" // 🔥 Direct hit to your Express backend server!
      : import.meta.env.VITE_API_URL,
  withCredentials: true, // Crucial for sending cookies back and forth across ports
});

export default axiosInstance;
