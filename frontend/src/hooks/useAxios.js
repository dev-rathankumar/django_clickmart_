import axios from "axios";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import useAuth from "./useAuth";

// Flags to handle token refresh
let isRefreshing = false;
let refreshPromise = null;

export const useAxios = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Add a request intercepter
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        const authToken = localStorage.getItem("accessToken");

        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add a response intercepter
    const responseIntercept = api.interceptors.response.use(
      (response) => response, // Pass through successful responses
      async (error) => {
        const orginalRequest = error.config; // Original request causing error
        const refreshToken = localStorage.getItem("refreshToken");
        if (
          error.response?.status === 401 &&
          !orginalRequest._retry &&
          refreshToken
        ) {
          orginalRequest._retry = true;

          // Ensure only one refresh request at a time
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshAccessToken(
              setAuth,
              refreshToken,
              navigate
            );
          }

          try {
            const newAccessToken = await refreshPromise; // Wait for token refresh

            orginalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Retry request with new token

            return api(orginalRequest); // Retry the original request
          } catch (error) {
            console.error("Failed to refresh token:", error);
            throw error; // Propagate error if refresh fails
          } finally {
            isRefreshing = false;
            refreshPromise = null; // Reset refresh state
          }
        }
        return Promise.reject(error); // Return configured Axios instance
      }
    );
    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [setAuth, navigate]);

  return { api };
};

// Function to refresh access token
const refreshAccessToken = async (setAuth, refreshToken, navigate) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_BASE_URL}/token/refresh/`, // Refresh expired access token
      { refresh: refreshToken }
    );

    const { access, refresh } = response.data;

    localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);

    setAuth((prev) => ({
      ...prev,
      accessToken: access,
      refreshToken: refresh || prev.refreshToken,
    }));

    return access;
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
    throw error;
  }
};
