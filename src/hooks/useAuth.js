// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedUser = localStorage.getItem('loggedUser');
    setIsLoggedIn(!!loggedUser);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/login', { email, password });
      if (response.data.message === 'Login successful') {
        localStorage.setItem('loggedUser', JSON.stringify(response.data));
        setIsLoggedIn(true);
        return true;
      }
    } catch (error) {
      console.error('Login failed', error);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('loggedUser');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);