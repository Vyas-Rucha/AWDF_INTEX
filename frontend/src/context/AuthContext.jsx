/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state from localStorage if available
  const [attendee, setAttendee] = useState(() => {
    try {
      const saved = localStorage.getItem('eventhub_attendee');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('eventhub_token') || null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('eventhub_role') || 'attendee';
  });

  // Login handler
  const login = (authData) => {
    const { attendee: user, token: authToken, role: userRole } = authData;
    setAttendee(user);
    setToken(authToken);
    setRole(userRole || 'attendee');

    if (user) localStorage.setItem('eventhub_attendee', JSON.stringify(user));
    if (authToken) localStorage.setItem('eventhub_token', authToken);
    if (userRole) localStorage.setItem('eventhub_role', userRole);
  };

  // Logout handler
  const logout = () => {
    setAttendee(null);
    setToken(null);
    setRole('attendee');

    localStorage.removeItem('eventhub_attendee');
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_role');
  };

  return (
    <AuthContext.Provider value={{ attendee, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
