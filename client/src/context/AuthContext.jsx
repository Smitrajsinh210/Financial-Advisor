import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem("afa_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/users/me");
        setUser(data.data.user);
      } catch (_error) {
        localStorage.removeItem("afa_token");
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("afa_token", data.data.token);
    setUser(data.data.user);
    toast.success("Welcome back");
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("afa_token", data.data.token);
    setUser(data.data.user);
    toast.success("Account created");
  };

  const logout = () => {
    localStorage.removeItem("afa_token");
    setUser(null);
    toast.success("Logged out");
  };

  const refreshProfile = async () => {
    const { data } = await api.get("/users/me");
    setUser(data.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
