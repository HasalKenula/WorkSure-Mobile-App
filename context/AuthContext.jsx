
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = username === "admin";

  const login = async (token, username) => {
    setIsAuthenticated(true);
    setJwtToken(token);
    setUsername(username);

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("username", username);
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setJwtToken(null);
    setUsername(null);

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("username");
  };

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedUsername = await AsyncStorage.getItem("username");

        if (token && savedUsername) {
          setIsAuthenticated(true);
          setJwtToken(token);
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Failed to load auth data", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        jwtToken,
        username,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}