import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('gym_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if password equals username
      if (email.toLowerCase() === password.toLowerCase()) {
        return false;
      }
      
      // API call would go here - using mock for now
      const response = await mockLogin(email, password, role);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('gym_user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if password equals username/email
      if (email.toLowerCase() === password.toLowerCase() || name.toLowerCase() === password.toLowerCase()) {
        return false;
      }
      
      // API call would go here - using mock for now
      const response = await mockRegister(name, email, password, role);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('gym_user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gym_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock API functions - replace with real API calls
const mockLogin = async (email: string, password: string, role?: UserRole) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  // Mock successful login
  return {
    success: true,
    user: {
      id: `${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: role || 'member'
    }
  };
};

const mockRegister = async (name: string, email: string, password: string, role: UserRole) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  // Mock successful registration
  return {
    success: true,
    user: {
      id: `${Date.now()}`,
      name,
      email,
      role
    }
  };
};