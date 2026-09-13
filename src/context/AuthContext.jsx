import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Simple mock authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUser({
        name: 'Admin User',
        role: 'Administrator',
        email: 'admin@livingspacehub.com',
      });
    }
  }, []);

  const login = async (email, password) => {
    // Mock login logic
    if (email && password) {
      setIsAuthenticated(true);
      setUser({
        name: 'Admin User',
        role: 'Administrator',
        email,
      });
      localStorage.setItem('isAdminAuth', 'true');
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAdminAuth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
