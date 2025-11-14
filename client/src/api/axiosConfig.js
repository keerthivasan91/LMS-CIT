import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000",  // Change to your backend URL
  withCredentials: false
});

// Auto-attach token if available
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default instance;
