'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const loginStatus = localStorage.getItem('isLoggedIn');
    const loginTime = localStorage.getItem('loginTime');
    
    if (loginStatus === 'true' && loginTime) {
      // Check if login is still valid (24 hours)
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsLoggedIn(true);
      } else {
        // Login expired
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        setIsLoggedIn(false);
      }
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn && pathname !== '/login') {
        router.push('/login');
      } else if (isLoggedIn && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isLoggedIn, isLoading, pathname, router]);

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin12345') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginTime', new Date().toISOString());
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    setIsLoggedIn(false);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}