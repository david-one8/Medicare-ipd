import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem('bearer_token') || null
  );

  const login = (t) => {
    setToken(t);
    localStorage.setItem('bearer_token', t);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('bearer_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);