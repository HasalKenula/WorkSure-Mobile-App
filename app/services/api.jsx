import axios from "axios";

const api = axios.create({
  baseURL: "http://10.60.95.79:8081",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
