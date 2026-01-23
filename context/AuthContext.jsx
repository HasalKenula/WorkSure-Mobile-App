import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  isAuthenticated: false,
  jwtToken: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // store only token
  const login = async (token) => {
    setIsAuthenticated(true);
    setJwtToken(token);
    await AsyncStorage.setItem("token", token);
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setJwtToken(null);
    await AsyncStorage.removeItem("token");
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        setJwtToken(token);
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, jwtToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
