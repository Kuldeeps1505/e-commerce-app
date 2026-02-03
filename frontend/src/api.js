// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:7000/api", // Change as per your backend port
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;