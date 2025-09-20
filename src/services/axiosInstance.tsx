import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "";

const adjustedBaseURL = baseURL.endsWith("/api") ? baseURL : `${baseURL}/api`;

const api = axios.create({
  baseURL: adjustedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const publicRoutes = ["/users/login", "/users/signup"];
    if (publicRoutes.includes(config.url || "")) {
      return config;
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        `No token found for protected route: ${config.url}. Blocking request.`,
      );
      return Promise.reject("User is not authenticated");
    }
    return config;
  },
  (error) => {
    // This part handles errors that might occur when creating the request.
    return Promise.reject(error);
  },
);

export default api;