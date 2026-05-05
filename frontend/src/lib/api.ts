import axios from "axios";

// Fast API backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token if needed in the future
apiClient.interceptors.request.use(
  (config) => {
    // You could fetch the token from localStorage or session here if FastAPI requires it.
    // For now, FastAPI and NextAuth are separate, but this is the hook point.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global API errors (e.g., 401 Unauthorized -> redirect to login)
    return Promise.reject(error);
  }
);

export const ResumeAPI = {
  parseResume: async (file: File, jobDescription: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    const response = await axios.post(`${API_URL}/resume/parse`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
