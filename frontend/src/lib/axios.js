import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: import.meta.env.MODE === "development"
  //   ? "http://localhost:5001/api"
  //   : "https://cashbook-ee9a.onrender.com/api",

  //change later
  baseURL: "https://cashbook-ee9a.onrender.com/api",
  withCredentials: true,
});
