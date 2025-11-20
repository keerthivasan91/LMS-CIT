import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true   // MOST IMPORTANT
});

// ❌ remove JWT token interceptor COMPLETELY

export default instance;
