// import axios from "axios";

// const client = axios.create({
//   baseURL: "/api/v1",
//   headers: { "Content-Type": "application/json" },
// });

// // Inject token on every request
// client.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle 401 globally — redirect to login
// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );

// export default client;
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "http://127.0.0.1:3000";

const client = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// const client = axios.create({
//   baseURL: "/api/v1",
//   headers: { "Content-Type": "application/json" },
// });

client.interceptors.request.use((config) => {
  // Pull token directly from the store state for reliability
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAlreadyOnLogin = window.location.pathname === "/login";

      // If we hit a 401, we MUST clear the store.
      // This will trigger a re-render in your App's ProtectedRoutes
      if (!isAlreadyOnLogin) {
        useAuthStore.getState().clearAuth();
        // Only redirect if necessary; usually your ProtectedRoute
        // will handle this automatically when 'token' becomes null
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default client;
