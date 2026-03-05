import React from "react";
import { Redirect, Slot } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // If already logged in → go to home
  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Slot />;
}