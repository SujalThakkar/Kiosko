import { createContext, useContext, useState, useCallback } from "react";
import { api, saveSession, loadSession, clearSession } from "../api/client";

const AuthContext = createContext(null);

const initialsOf = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ROLE_LABEL = {
  student: "Student",
  professor: "Professor",
  lab_assistant: "Lab Assistant",
};

function withDisplayFields(user) {
  return {
    ...user,
    roleLabel: ROLE_LABEL[user.role] || user.role,
    avatarInitials: initialsOf(user.name),
  };
}

export function AuthProvider({ children }) {
  const existing = loadSession();
  const [user, setUser] = useState(existing ? withDisplayFields(existing.user) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (somaiyaId, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(somaiyaId, password);
      saveSession(data.access_token, data.user);
      const withFields = withDisplayFields(data.user);
      setUser(withFields);
      return withFields;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
