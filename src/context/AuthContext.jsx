import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api.js";

const AuthCtx = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
      setServerError(null);
      return user;
    } catch (error) {
      // A missing database should not look like "signed out" forever;
      // surface it so the UI can explain what to fix.
      setUser(null);
      setServerError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { user } = await api.login(email, password);
    setUser(user);
    setServerError(null);
    return user;
  }, []);

  const signup = useCallback(async (payload) => {
    const { user } = await api.signup(payload);
    setUser(user);
    setServerError(null);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, serverError, login, signup, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}
